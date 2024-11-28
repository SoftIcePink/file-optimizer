export interface FileData {
    hash: string
    file_path: string
    file_size: number
    last_modified: string
    duplicates: string[]
  }
  
  export interface VerificationResult {
    path: string
    hash: string
    size: number
    lastModified: string
  }
  