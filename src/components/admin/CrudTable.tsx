"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export function CrudTable({
  data,
  onEdit,
  onDelete,
}: {
  data: any[];
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}) {
  if (!data?.length)
    return <p className="text-muted-foreground">Belum ada data.</p>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Object.keys(data[0])
            .filter((k) => k !== "_id" && k !== "__v")
            .map((key) => (
              <TableHead key={key}>{key}</TableHead>
            ))}
          <TableHead>Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item._id}>
            {Object.keys(item)
              .filter((k) => k !== "_id" && k !== "__v")
              .map((key) => (
                <TableCell key={key}>{String(item[key])}</TableCell>
              ))}
            <TableCell>
              <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="ml-2"
                onClick={() => onDelete(item._id)}
              >
                Hapus
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
