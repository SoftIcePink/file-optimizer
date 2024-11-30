'use client';

import React, { useState, useEffect } from 'react';
import DuplicateFiles from '@/components/DuplicateFiles';
import FileItem from '@/components/FileItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { File } from '@/types/file';

const CHUNK_SIZE = 20; // Number of files to render at a time

const FileExplorer: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [renderedFiles, setRenderedFiles] = useState<File[]>([]);
  const [sortBy, setSortBy] = useState<'hash' | 'path'>('hash');
  const [error, setError] = useState<string | null>(null);
  const [chunkIndex, setChunkIndex] = useState(0); // Tracks which chunk to render next

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_RUST_API_URL}/api/files`);
        if (!response.ok) throw new Error(`Error fetching files: ${response.statusText}`);

        const data = await response.json();
        setFiles(data);
        setRenderedFiles(data.slice(0, CHUNK_SIZE)); // Render initial chunk
      } catch (error: any) {
        setError(error.message);
      }
    };

    fetchFiles();
  }, []);

  useEffect(() => {
    // Append the next chunk of files when `chunkIndex` changes
    const nextChunk = files.slice(0, (chunkIndex + 1) * CHUNK_SIZE);
    setRenderedFiles(nextChunk);
  }, [chunkIndex, files]);

  const loadMoreFiles = () => {
    // Increment chunk index to load more files
    if (chunkIndex * CHUNK_SIZE < files.length) {
      setChunkIndex((prev) => prev + 1);
    }
  };

  const sortedFiles = React.useMemo(() => {
    return [...renderedFiles].sort((a, b) =>
      sortBy === 'hash'
        ? a.file_hash.localeCompare(b.file_hash)
        : a.file_path.localeCompare(b.file_path)
    );
  }, [renderedFiles, sortBy]);

  const groupedFiles = React.useMemo(() => {
    return sortedFiles.reduce((acc, file) => {
      const key = sortBy === 'hash' ? file.file_hash : file.file_directory;
      if (!acc[key]) acc[key] = [];
      acc[key].push(file);
      return acc;
    }, {} as Record<string, File[]>);
  }, [sortedFiles, sortBy]);

  const duplicateFiles = React.useMemo(() => {
    return Object.values(groupedFiles).filter((group) => group.length > 1);
  }, [groupedFiles]);

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load files: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>File Explorer</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hash">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hash" onClick={() => setSortBy('hash')}>
              Sort by Hash
            </TabsTrigger>
            <TabsTrigger value="path" onClick={() => setSortBy('path')}>
              Sort by Path
            </TabsTrigger>
            <TabsTrigger value="duplicates">Duplicate Files</TabsTrigger>
          </TabsList>
          <TabsContent value="hash">
            <RenderGroupedFiles groupedFiles={groupedFiles} />
            {chunkIndex * CHUNK_SIZE < files.length && (
              <button
                onClick={loadMoreFiles}
                className="mt-4 p-2 bg-blue-500 text-white rounded"
              >
                Load More Files
              </button>
            )}
          </TabsContent>
          <TabsContent value="path">
            <RenderGroupedFiles groupedFiles={groupedFiles} />
            {chunkIndex * CHUNK_SIZE < files.length && (
              <button
                onClick={loadMoreFiles}
                className="mt-4 p-2 bg-blue-500 text-white rounded"
              >
                Load More Files
              </button>
            )}
          </TabsContent>
          <TabsContent value="duplicates">
            <DuplicateFiles duplicateFiles={duplicateFiles} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const RenderGroupedFiles: React.FC<{ groupedFiles: Record<string, File[]> }> = ({
  groupedFiles,
}) => {
  return (
    <ScrollArea className="h-[600px]">
      {Object.entries(groupedFiles).map(([key, groupFiles]) => (
        <div key={key} className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Group: {key}</h2>
          {groupFiles.map((file) => (
            <FileItem key={file.file_path} file={file} />
          ))}
        </div>
      ))}
    </ScrollArea>
  );
};

export default FileExplorer;
