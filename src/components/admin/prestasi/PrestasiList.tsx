"use client";
import { usePrestasi } from "@/hooks/usePrestasi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PrestasiList() {
  const { prestasi, isLoading, deletePrestasi } = usePrestasi();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {prestasi?.map((item) => (
        <Card key={item._id} className="p-4 flex flex-col gap-2">
          <div className="font-semibold">{item.nama}</div>
          <div className="text-xs text-gray-500">Tahun: {item.tahun}</div>
          <div className="text-sm">{item.deskripsi}</div>
          <Button
            variant="destructive"
            onClick={() => deletePrestasi(item._id)}
          >
            Hapus
          </Button>
        </Card>
      ))}
    </div>
  );
}
