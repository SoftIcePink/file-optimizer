'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FileUploader from './FileUploader'
import FileList from './FileList'
import SystemStorage from './SystemStorage'
import FolderVerifier from './FolderVerifier'
import { FileData, VerificationResult } from '@/types/file'

export default function FileManager() {
  const [files, setFiles] = useState<FileData[]>([])
  const [systemFiles, setSystemFiles] = useState<string[]>([])
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([])
  const [jsonFilePath, setJsonFilePath] = useState<string | null>(null)

  useEffect(() => {
    fetchFiles()
    fetchSystemFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files')
      if (!response.ok) throw new Error('Failed to fetch files')
      const data = await response.json()
      setFiles(data)
    } catch (error) {
      console.error('Error fetching files:', error)
    }
  }

  const fetchSystemFiles = async () => {
    try {
      const response = await fetch('/api/system-files');
      if (!response.ok) throw new Error('Failed to fetch system files');
      const data = await response.json();
      setSystemFiles(data.files); // Only use the `files` array
    } catch (error) {
      console.error('Error fetching system files:', error);
      setSystemFiles([]); // Ensure it's always an array
    }
  }  

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to upload file')

      await fetchFiles()
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  const handleDeleteFile = async (hash: string) => {
    try {
      const response = await fetch(`/api/files/${hash}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete file')

      await fetchFiles()
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  const handleUpdateFile = async (hash: string, newData: Partial<FileData>) => {
    try {
      const response = await fetch(`/api/files/${hash}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      })

      if (!response.ok) throw new Error('Failed to update file')

      await fetchFiles()
    } catch (error) {
      console.error('Error updating file:', error)
    }
  }

  const handleVerifyFolder = async (folderPath: string) => {
    try {
      const response = await fetch('/api/verify-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderPath }),
      })

      if (!response.ok) throw new Error('Failed to verify folder')

      const data = await response.json()
      setVerificationResults(data.results)
      setJsonFilePath(data.jsonFilePath)
    } catch (error) {
      console.error('Error verifying folder:', error)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>File Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="verify">Verify</TabsTrigger>
          </TabsList>
          <TabsContent value="upload">
            <FileUploader onUpload={handleFileUpload} />
          </TabsContent>
          <TabsContent value="files">
            <FileList files={files} onDelete={handleDeleteFile} onUpdate={handleUpdateFile} />
          </TabsContent>
          <TabsContent value="system">
            <SystemStorage files={systemFiles} />
          </TabsContent>
          <TabsContent value="verify">
            <FolderVerifier onVerify={handleVerifyFolder} results={verificationResults} jsonFilePath={jsonFilePath} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

