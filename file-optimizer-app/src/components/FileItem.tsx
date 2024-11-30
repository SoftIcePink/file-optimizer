'use client'

import React from 'react'
import { File } from '../types/file'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FileItemProps {
  file: File
}

const FileItem: React.FC<FileItemProps> = ({ file }) => {
  return (
    <Card className="mb-2">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold">{file.file_path}</p>
            <p className="text-sm text-gray-500">Directory: {file.file_directory}</p>
            <p className="text-sm text-gray-500">Size: {formatFileSize(file.file_size)}</p>
            <p className="text-sm text-gray-500">Last Modified: {new Date(file.last_modified * 1000).toLocaleString()}</p>
          </div>
          <Badge variant="secondary" className="text-xs">{file.file_hash}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  const kb = bytes / 1024
  if (kb < 1024) return kb.toFixed(2) + ' KB'
  const mb = kb / 1024
  if (mb < 1024) return mb.toFixed(2) + ' MB'
  const gb = mb / 1024
  return gb.toFixed(2) + ' GB'
}

export default FileItem

