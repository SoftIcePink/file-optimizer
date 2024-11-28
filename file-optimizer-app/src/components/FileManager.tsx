'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FileUploader from '@/components/FileUploader'
import FileExplorer from '@/components/FileExplorer'
import SystemStorage from '@/components/SystemStorage'
import FolderVerifier from '@/components/FolderVerifier'
import { FileData, VerificationResult } from '@/types/file'

export default function FileManager() {
  const [files, setFiles] = useState<FileData[]>([])
  const [directories, setDirectories] = useState<string[]>([])
  const [currentDirectory, setCurrentDirectory] = useState<string>('/')
  const [systemFiles, setSystemFiles] = useState<string[]>([])
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([])
  const [jsonFilePath, setJsonFilePath] = useState<string | null>(null)

  useEffect(() => {
    fetchFiles(currentDirectory)
    fetchSystemFiles()
  }, [currentDirectory])

  const fetchFiles = async (directory: string) => {
    try {
      const response = await fetch(`/api/files?directory=${encodeURIComponent(directory)}`)
      if (!response.ok) throw new Error('Failed to fetch files')
      const data = await response.json()
      setFiles(data.files)
      setDirectories(data.directories)
    } catch (error) {
      console.error('Error fetching files:', error)
    }
  }

  const fetchSystemFiles = async () => {
    try {
      const response = await fetch('/api/system-files');
      if (!response.ok) throw new Error('Failed to fetch system files');
      const data = await response.json();
      setSystemFiles(data.files);
    } catch (error) {
      console.error('Error fetching system files:', error);
      setSystemFiles([]);
    }
  }  

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('directory', currentDirectory)

      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to upload file')

      await fetchFiles(currentDirectory)
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

      await fetchFiles(currentDirectory)
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

      await fetchFiles(currentDirectory)
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
        <Tabs defaultValue="explorer" className="space-y-4">
          <TabsList>
            <TabsTrigger value="explorer">Explorer</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="verify">Verify</TabsTrigger>
          </TabsList>
          <TabsContent value="explorer">
            <FileExplorer
              files={files}
              directories={directories}
              currentDirectory={currentDirectory}
              onDirectoryChange={setCurrentDirectory}
              onDelete={handleDeleteFile}
              onUpdate={handleUpdateFile}
            />
          </TabsContent>
          <TabsContent value="upload">
            <FileUploader onUpload={handleFileUpload} currentDirectory={currentDirectory} />
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
