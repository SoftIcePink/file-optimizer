export interface File {
  id: string // MongoDB's ObjectId serialized as a string
  file_path: string
  file_hash: string
  file_size: number
  last_modified: number // Unix timestamp (or floating-point if fractional seconds are included)
  file_directory: string
}
