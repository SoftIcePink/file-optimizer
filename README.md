# Quick retrospective on this project
This was a 1-week project I put in place with total ~36h to 42h active work on it.
Since I'm a very lazy person, my goal was to create an app that would help me clean up duplicate files on some of my PC and index them.
Some apps already do that, but at that time I already had an idea in my head and a plan.

I usually code in C#, but this time I wanted to learn while doing something. My goal went from creating a useful app to learning and challenging myself.

Fast forward a few hours and I now had built a python version, rust version, tried to do a go version (didn't push it) and a Node.js (more of a NextJs version but it went wrong at some point).

They all worked, but beware that you're database will fill up if you're not using any safety precaution such as limit size of db. I ended up filling my drives to the brim and my PC couldn't boot (had to use a live usb and delete manually some files) 

--

# File Scanner and Metadata Uploader

This Rust application scans a directory for all files, computes their metadata (such as file size, SHA-256 hash, and last modified time), and stores the information in a MongoDB database.

---

## Features

- **Recursive File Scanning**: Scans directories and subdirectories for all files.
- **File Metadata Extraction**: Extracts details like file size, last modified timestamp, and directory.
- **SHA-256 Hashing**: Generates a unique hash for each file (currently based on the file path).
- **MongoDB Integration**: Uploads metadata to a MongoDB database for efficient storage and retrieval.

---

## Prerequisites

1. **Rust**: Install Rust from [rust-lang.org](https://www.rust-lang.org/).
2. **MongoDB**: Install MongoDB or use a Docker container:
   ```bash
   docker run --name mongodb -d -p 27017:27017 mongo:latest
   ```
3. **Dependencies**: Add these to your `Cargo.toml`:
   ```toml
   [dependencies]
   walkdir = "2.4"
   mongodb = "2.4"
   sha2 = "0.10"
   tokio = { version = "1", features = ["full"] }
   ```

---

## Installation and Setup

1. Clone the repository or create a new Rust project:
   ```bash
   cargo new file_scanner
   cd file_scanner
   ```

2. Add dependencies to `Cargo.toml` (see above).

3. Copy the application code into your `main.rs` file.

4. Build the project:
   ```bash
   cargo build
   ```

---

## Usage

1. Ensure MongoDB is running locally on `localhost:27017`.
2. Run the application:
   ```bash
   cargo run
   ```

3. The application will:
   - Scan the directory `C:\` (you can change it in the code).
   - Extract file metadata.
   - Insert the metadata into the MongoDB `fileOptimizer.files_rust` collection.

---

## Database Schema

### MongoDB Collection: `files_rust`

Each document contains:

| Field            | Type      | Description                          |
|-------------------|-----------|--------------------------------------|
| `file_path`       | `String`  | Absolute path of the file.           |
| `file_hash`       | `String`  | SHA-256 hash (currently file path).  |
| `file_size`       | `Int64`   | File size in bytes.                  |
| `last_modified`   | `Int64`   | Last modified timestamp (Unix time). |
| `file_directory`  | `String`  | Parent directory path.               |

Example document:
```json
{
  "file_path": "C:\\example\\file.txt",
  "file_hash": "d2d2d2d2d2d2d2...",
  "file_size": 1024,
  "last_modified": 1693425243,
  "file_directory": "C:\\example"
}
```

---

## Notes

1. **Hashing File Content**: The application currently uses the file path for hashing. To hash the actual file content, replace the `compute_file_hash` function with this:
   ```rust
   fn compute_file_hash(path: &str) -> String {
       let mut file = fs::File::open(path).expect("Failed to open file");
       let mut hasher = Sha256::new();
       std::io::copy(&mut file, &mut hasher).expect("Failed to hash file content");
       format!("{:x}", hasher.finalize())
   }
   ```
2. **Directory to Scan**: Update the `root` variable in the code to change the directory.

---

## Future Improvements

- Hash file content instead of the file path.
- Add error handling for file and database operations.
- Optimize database queries for duplicate detection.

---

## License

This project is open-source and available under the [MIT License](LICENSE).

---

## Acknowledgments

- Rust ecosystem and its amazing community.
- MongoDB for the database backend.
- OpenAI for helpful insights and code snippets.
