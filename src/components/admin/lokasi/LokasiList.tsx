"use client";
import { useLokasi } from "@/hooks/useLokasi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LokasiList() {
  const { lokasi, isLoading, deleteLokasi } = useLokasi();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {lokasi?.map((item) => (
        <Card key={item._id} className="p-4 flex flex-col gap-2">
          <div className="font-semibold">{item.nama}</div>
          <div className="text-sm">{item.alamat}</div>
          <div className="text-xs text-gray-500">
            Lat: {item.koordinat.lat}, Lng: {item.koordinat.lng}
          </div>
          <div className="text-xs">{item.deskripsi}</div>
          <Button variant="destructive" onClick={() => deleteLokasi(item._id)}>
            Hapus
          </Button>
        </Card>
      ))}
    </div>
  );
}
