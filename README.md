# File Duplication Detection Service

This service identifies duplicate files (doublons) on your system by hashing file contents and comparing them to previously hashed files. It provides a backend API to manage the duplication detection process and a frontend interface to display results.

---

## Features

1. **File Hashing**:
   - Uses fast hashing algorithms (e.g., Blake3 or SHA-256).
   - Supports chunk-based hashing for large files.

2. **Database Integration**:
   - Stores file metadata and hashes in a MongoDB database.
   - Tracks duplicates (doublons) efficiently with indexed queries.

3. **Real-Time Updates**:
   - Uses WebSockets to notify the frontend of file changes or new duplicates.

4. **Frontend Interface**:
   - Provides an interactive dashboard to view and manage duplicate files.
   - Supports filtering, sorting, and searching for files.

---

## Architecture Overview

### **Backend**
- **Language**: Node.js (JavaScript/TypeScript) or Go
- **Framework**: 
  - Node.js: [NestJS](https://nestjs.com/) or [Express.js](https://expressjs.com/)
  - Go: [Gin](https://gin-gonic.com/) or [Fiber](https://gofiber.io/)
- **Database**: MongoDB
- **Features**:
  - Scans files, hashes them, and stores metadata.
  - Provides a REST/GraphQL API to serve results.
  - Implements WebSockets for real-time updates.

### **Frontend**
- **Framework**: [React.js](https://reactjs.org/) or [Next.js](https://nextjs.org/)
- **Features**:
  - Dynamic table view for duplicates.
  - Search, filter, and sort functionality.
  - Real-time UI updates via WebSockets.

---

## Technical Stack

| **Component**         | **Technology**                       | **Purpose**                                     |
|------------------------|---------------------------------------|------------------------------------------------|
| **Backend**            | Node.js or Go                        | File hashing, API, and database interaction     |
| **Database**           | MongoDB                              | Store file hashes and metadata                 |
| **Frontend**           | React.js or Next.js                  | User interface to display and manage results   |
| **Real-Time Updates**  | WebSockets (Socket.IO or Go-native)  | Notify frontend about duplicates in real-time  |

---

## Database Schema

### **File Metadata Collection**
Stores information about each file:
```json
{
  "hash": "d41d8cd98f00b204e9800998ecf8427e",
  "file_path": "C:\\Users\\User\\Documents\\example.txt",
  "last_modified": "2024-11-27T12:34:56Z",
  "file_size": 1024,
  "duplicates": [
    {
      "file_path": "C:\\Backup\\example_copy.txt",
      "last_modified": "2024-11-26T10:20:30Z"
    }
  ]
}
