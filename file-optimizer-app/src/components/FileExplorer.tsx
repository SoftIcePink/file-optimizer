import { useState } from 'react'
import { FileData } from '@/types/file'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Folder, File, ArrowLeft } from 'lucide-react'

interface FileExplorerProps {
  files: FileData[]
  directories: string[]
  currentDirectory: string
  onDirectoryChange: (directory: string) => void
  onDelete: (hash: string) => void
  onUpdate: (hash: string, newData: Partial<FileData>) => void
}

export default function FileExplorer({
  files,
  directories,
  currentDirectory,
  onDirectoryChange,
  onDelete,
  onUpdate
}: FileExplorerProps) {
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

  const handleDirectoryClick = (directory: string) => {
    onDirectoryChange(directory)
  }

  const handleBackClick = () => {
    const parentDirectory = currentDirectory.split('/').slice(0, -1).join('/') || '/'
    onDirectoryChange(parentDirectory)
  }

  return (
    <div>
      <div className="mb-4 flex items-center">
        <Button onClick={handleBackClick} variant="outline" size="sm" className="mr-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <span className="text-sm text-muted-foreground">{currentDirectory}</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Last Modified</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {directories.map((directory) => (
            <TableRow key={directory} className="cursor-pointer hover:bg-muted/50" onClick={() => handleDirectoryClick(directory)}>
              <TableCell><Folder className="h-4 w-4" /></TableCell>
              <TableCell colSpan={4}>{directory.split('/').pop()}</TableCell>
            </TableRow>
          ))}
          {files.map((file) => (
            <TableRow key={file.hash}>
              <TableCell><File className="h-4 w-4" /></TableCell>
              <TableCell>
                {editingHash === file.hash ? (
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                  />
                ) : (
                  file.file_path.split('/').pop()
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
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

