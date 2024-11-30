from pymongo import MongoClient
import os
import hashlib
from tqdm import tqdm
import time
import sys

# MongoDB Configuration
mongo_uri = "mongodb://localhost:27017"
db_name = "fileOptimizer"
collection_name = "files_python"

# Attempt to establish a MongoDB connection
try:
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)  # 5-second timeout
    client.admin.command('ping')  # Test the connection
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    sys.exit(1)  # Exit if connection fails

db = client[db_name]
collection = db[collection_name]

# Ensure index on file_path
collection.create_index("file_path", unique=True)

def compute_file_hash(file_path):
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(8192):
            hasher.update(chunk)
    return hasher.hexdigest()

def is_file_scanned(file_path):
    return collection.count_documents({"file_path": file_path}) > 0

def process_file(file_path):
    stats = os.stat(file_path)
    file_hash = compute_file_hash(file_path)
    return {
        "file_path": file_path,
        "file_hash": file_hash,
        "file_size": stats.st_size,
        "last_modified": stats.st_mtime,
        "file_directory": os.path.dirname(file_path)
    }

def scan_directory(root):
    start_time = time.time()
    scanned_files = 0
    skipped_files = 0

    # Traverse the entire file system starting from the root
    with tqdm(desc="Scanning files", unit="file") as pbar:
        for dirpath, _, filenames in os.walk(root, onerror=None):
            for file in filenames:
                file_path = os.path.join(dirpath, file)
                try:
                    # Skip files that are already scanned
                    if is_file_scanned(file_path):
                        pbar.set_postfix({"status": "Already scanned"})
                        pbar.update(1)
                        continue

                    # Process the file and insert it into MongoDB
                    doc = process_file(file_path)
                    collection.insert_one(doc)
                    scanned_files += 1

                    elapsed_time = time.time() - start_time
                    avg_time_per_file = elapsed_time / (scanned_files + skipped_files)
                    estimated_time_remaining = avg_time_per_file * (scanned_files + skipped_files)

                    pbar.set_postfix({
                        "status": "Inserted",
                        "Files Scanned": scanned_files,
                        "Files Skipped": skipped_files,
                        "ETA (s)": f"{estimated_time_remaining:.2f}"
                    })
                    pbar.update(1)
                except FileNotFoundError:
                    # Skip inaccessible files
                    skipped_files += 1
                    pbar.set_postfix({"status": "File not found", "Files Skipped": skipped_files})
                    pbar.update(1)
                except PermissionError:
                    # Skip files or directories with permission issues
                    skipped_files += 1
                    pbar.set_postfix({"status": "Permission denied", "Files Skipped": skipped_files})
                    pbar.update(1)
                except Exception as e:
                    # Log any other errors and skip the file
                    print(f"Error processing {file_path}: {e}")
                    skipped_files += 1
                    pbar.set_postfix({"status": "Error", "Files Skipped": skipped_files})
                    pbar.update(1)

if __name__ == "__main__":
    # Ensure this script is run with elevated permissions to access system files
    root_directory = "C:\\"
    print(f"Scanning all files starting from {root_directory}.")
    scan_directory(root_directory)
