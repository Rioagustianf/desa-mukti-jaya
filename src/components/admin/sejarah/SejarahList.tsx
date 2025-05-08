"use client";
import { useSejarah } from "@/hooks/useSejarah";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SejarahList() {
  const { sejarah, isLoading, deleteSejarah } = useSejarah();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sejarah?.map((item) => (
        <Card key={item._id} className="p-4 flex flex-col gap-2">
          <div className="font-semibold">{item.judul}</div>
          <div className="text-sm">{item.isi}</div>
          <div className="text-xs text-gray-500">Tahun: {item.tahun}</div>
          <Button variant="destructive" onClick={() => deleteSejarah(item._id)}>
            Hapus
          </Button>
        </Card>
      ))}
    </div>
  );
}
