import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SystemStorageProps {
  files: string[] | undefined | null;
}

export default function SystemStorage({ files }: SystemStorageProps) {
  if (!Array.isArray(files) || files.length === 0) {
    return <div>No system files found.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>File Path</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file, index) => (
          <TableRow key={index}>
            <TableCell>{file}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
