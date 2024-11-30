'use client'

import React from 'react'
import { File } from '@/types/file'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import FileItem from '@/components/FileItem'

interface DuplicateFilesProps {
  duplicateFiles: File[][]
}

const DuplicateFiles: React.FC<DuplicateFilesProps> = ({ duplicateFiles }) => {
  if (!duplicateFiles.length) {
    return (
      <p className="text-gray-500">No duplicate files found yet.</p>
    )
  }

  return (
    <ScrollArea className="h-[600px]">
      <Accordion type="single" collapsible className="w-full">
        {duplicateFiles.map((group, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>
              {group[0].file_hash} ({group.length} duplicates)
            </AccordionTrigger>
            <AccordionContent>
              {group.map((file) => (
                <FileItem key={file.file_path} file={file} />
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ScrollArea>
  )
}

export default DuplicateFiles
