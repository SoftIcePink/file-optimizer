use actix_web::{web, App, HttpServer, Responder, HttpResponse, middleware::Compress};
use futures_util::stream::TryStreamExt;
use mongodb::{bson::doc, bson::oid::ObjectId, options::ClientOptions, Client};
use serde::{Deserialize, Serialize};
use serde_json;
use actix_cors::Cors;
use async_stream::stream;
use bytes::Bytes; // Import Bytes for streaming responses

#[derive(Serialize, Deserialize, Debug)]
struct File {
    #[serde(rename = "_id")]
    id: ObjectId,
    file_path: String,
    file_hash: String,
    file_size: u64,
    last_modified: f64,
    file_directory: String,
}

async fn get_files_stream(client: web::Data<Client>) -> impl Responder {
    let collection = client.database("fileOptimizer").collection::<File>("files_python");

    let mut cursor = match collection.find(None, None).await {
        Ok(c) => c,
        Err(e) => {
            println!("Error querying MongoDB: {:?}", e);
            return HttpResponse::InternalServerError().finish();
        },
    };

    let file_stream = stream! {
        while let Ok(Some(file)) = cursor.try_next().await {
            let serialized = match serde_json::to_string(&file) {
                Ok(json) => json,
                Err(e) => {
                    println!("Error serializing file: {:?}", e);
                    break;
                },
            };
            yield Ok::<Bytes, actix_web::Error>(Bytes::from(serialized + "\n")); // Convert String to Bytes
        }
    };

    HttpResponse::Ok()
        .content_type("application/json")
        .streaming(file_stream)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let client_options = ClientOptions::parse("mongodb://localhost:27017").await.unwrap();
    let client = Client::with_options(client_options).unwrap();

    HttpServer::new(move || {
        App::new()
            .wrap(Cors::default().allow_any_origin().allow_any_method().allow_any_header()) // CORS support
            .wrap(Compress::default()) // Enable response compression
            .app_data(web::Data::new(client.clone()))
            .route("/api/files", web::get().to(get_files_stream)) // Stream files
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
