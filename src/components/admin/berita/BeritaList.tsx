"use client";
import { useBerita } from "@/hooks/useBerita";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BeritaList() {
  const { berita, isLoading, deleteBerita } = useBerita();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {berita?.map((item) => (
        <Card key={item._id} className="p-4 flex flex-col gap-2">
          <div className="font-semibold">{item.title}</div>
          <div className="text-xs text-gray-500">
            {item.date} - {item.author}
          </div>
          <div className="text-sm">{item.content}</div>
          <Button variant="destructive" onClick={() => deleteBerita(item._id)}>
            Hapus
          </Button>
        </Card>
      ))}
    </div>
  );
}
