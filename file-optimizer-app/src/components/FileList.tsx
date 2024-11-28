import { useState } from 'react'
import { FileData } from '@/types/file'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FileListProps {
  files: FileData[]
  onDelete: (hash: string) => void
  onUpdate: (hash: string, newData: Partial<FileData>) => void
}

export default function FileList({ files, onDelete, onUpdate }: FileListProps) {
  const [editingHash, setEditingHash] = useState<string | null>(null)
  const [editedName, setEditedName] = useState('')

  const handleEdit = (file: FileData) => {
    setEditingHash(file.hash)
    setEditedName(file.file_path)
  }

  const handleSave = (hash: string) => {
    onUpdate(hash, { file_path: editedName })
    setEditingHash(null)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Hash</TableHead>
          <TableHead>File Name</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Last Modified</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
  {files.map((file, index) => (
    <TableRow key={`${file.hash}-${index}`}>
      <TableCell>{file.hash}</TableCell>
      <TableCell>
        {editingHash === file.hash ? (
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        ) : (
          file.file_path
        )}
      </TableCell>
      <TableCell>{formatFileSize(file.file_size)}</TableCell>
      <TableCell>{new Date(file.last_modified).toLocaleString()}</TableCell>
      <TableCell>
        {editingHash === file.hash ? (
          <Button onClick={() => handleSave(file.hash)} variant="outline" size="sm">
            Save
          </Button>
        ) : (
          <Button onClick={() => handleEdit(file)} variant="outline" size="sm">
            Edit
          </Button>
        )}
        <Button onClick={() => onDelete(file.hash)} variant="destructive" size="sm" className="ml-2">
          Delete
        </Button>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

    </Table>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

