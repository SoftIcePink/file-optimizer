import { useState } from 'react'
import { VerificationResult } from '@/types/file'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FolderVerifierProps {
  onVerify: (folderPath: string) => void
  results: VerificationResult[]
  jsonFilePath: string | null
}

export default function FolderVerifier({ onVerify, results, jsonFilePath }: FolderVerifierProps) {
  const [folderPath, setFolderPath] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onVerify(folderPath)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          type="text"
          value={folderPath}
          onChange={(e) => setFolderPath(e.target.value)}
          placeholder="Enter folder path"
        />
        <Button type="submit">
          Verify Folder
        </Button>
      </form>
      {jsonFilePath && (
        <Card>
          <CardHeader>
            <CardTitle>JSON File Path</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{jsonFilePath}</p>
          </CardContent>
        </Card>
      )}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Verification Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Path</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Last Modified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell>{result.path}</TableCell>
                    <TableCell>{result.hash}</TableCell>
                    <TableCell>{result.size} bytes</TableCell>
                    <TableCell>{new Date(result.lastModified).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

