use sha2::{Sha256, Digest};
use walkdir::WalkDir;
use mongodb::{bson::doc, Client, IndexModel};
use std::{fs, io};
use std::io::Read;
use std::time::{UNIX_EPOCH, Instant};

#[tokio::main]
async fn main() -> mongodb::error::Result<()> {
    let client_uri = "mongodb://localhost:27017";
    let client = Client::with_uri_str(client_uri).await?;
    let database = client.database("fileOptimizer");
    let collection = database.collection::<mongodb::bson::Document>("files_rust");

    // Ensure index on file_path
    collection
        .create_index(
            IndexModel::builder()
                .keys(doc! { "file_path": 1 })
                .options(Some(mongodb::options::IndexOptions::builder().unique(true).build()))
                .build(),
            None,
        )
        .await?;

    let root = "C:\\";
    println!("Scanning all files starting from {}.", root);

    let mut scanned_files = 0;
    let mut skipped_files = 0;
    let start_time = Instant::now();

    for entry in WalkDir::new(root).into_iter().filter_map(|e| e.ok()) {
        if entry.file_type().is_file() {
            let path = entry.path();
            if let Some(file_path) = path.to_str() {
                if is_file_scanned(&collection, file_path).await {
                    skipped_files += 1;
                    log_status("Already scanned", scanned_files, skipped_files, start_time);
                    continue;
                }
                match process_file(file_path).await {
                    Ok(doc) => {
                        collection.insert_one(doc, None).await?;
                        scanned_files += 1;
                        log_status("Inserted", scanned_files, skipped_files, start_time);
                    }
                    Err(e) if e.kind() == io::ErrorKind::NotFound => {
                        skipped_files += 1;
                        log_status("File not found", scanned_files, skipped_files, start_time);
                    }
                    Err(e) if e.kind() == io::ErrorKind::PermissionDenied => {
                        skipped_files += 1;
                        log_status("Permission denied", scanned_files, skipped_files, start_time);
                    }
                    Err(e) => {
                        eprintln!("Error processing {}: {}", file_path, e);
                        skipped_files += 1;
                        log_status("Error", scanned_files, skipped_files, start_time);
                    }
                }
            }
        }
    }

    println!(
        "Scan complete. Scanned files: {}, Skipped files: {}, Time elapsed: {:.2?}",
        scanned_files,
        skipped_files,
        start_time.elapsed()
    );

    Ok(())
}

async fn is_file_scanned(
    collection: &mongodb::Collection<mongodb::bson::Document>,
    file_path: &str,
) -> bool {
    let filter = doc! { "file_path": file_path };
    collection.count_documents(filter, None).await.unwrap_or(0) > 0
}

async fn process_file(file_path: &str) -> Result<mongodb::bson::Document, io::Error> {
    let metadata = fs::metadata(file_path)?;

    // Compute file hash using file contents
    let file_hash = compute_file_hash(file_path)?;

    let last_modified = metadata
        .modified()
        .ok()
        .and_then(|mtime| mtime.duration_since(UNIX_EPOCH).ok())
        .map(|duration| duration.as_secs() as i64)
        .unwrap_or(-1);

    Ok(doc! {
        "file_path": file_path,
        "file_hash": file_hash,
        "file_size": metadata.len() as i64,
        "last_modified": last_modified,
        "file_directory": std::path::Path::new(file_path)
            .parent()
            .unwrap_or_else(|| std::path::Path::new(""))
            .to_str()
            .unwrap_or("")
    })
}

fn compute_file_hash(file_path: &str) -> Result<String, io::Error> {
    let mut file = fs::File::open(file_path)?;
    let mut hasher = Sha256::new();
    let mut buffer = [0; 8192];
    while let Ok(bytes_read) = file.read(&mut buffer) {
        if bytes_read == 0 {
            break;
        }
        hasher.update(&buffer[..bytes_read]);
    }
    Ok(format!("{:x}", hasher.finalize()))
}

fn log_status(status: &str, scanned_files: usize, skipped_files: usize, start_time: Instant) {
    let elapsed_time = start_time.elapsed().as_secs_f64();
    let total_files = scanned_files + skipped_files;
    let avg_time_per_file = if total_files > 0 {
        elapsed_time / total_files as f64
    } else {
        0.0
    };
    let estimated_remaining_time = if total_files > 0 {
        avg_time_per_file * total_files as f64
    } else {
        0.0
    };

    println!(
        "[Elapsed: {elapsed:.2}s] Status: {status}, Files Scanned: {scanned_files}, Files Skipped: {skipped_files}, ETA (s): {eta:.2}",
        elapsed = elapsed_time,
        status = status,
        scanned_files = scanned_files,
        skipped_files = skipped_files,
        eta = estimated_remaining_time
    );
}
