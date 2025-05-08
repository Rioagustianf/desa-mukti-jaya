"use client";
import { useGaleri } from "@/hooks/useGaleri";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function GaleriList() {
  const { galeri, isLoading, deleteGaleri } = useGaleri();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {galeri?.map((item) => (
        <Card key={item._id} className="p-4 flex flex-col gap-2">
          <Image
            src={item.image}
            alt={item.caption}
            width={300}
            height={200}
            className="object-cover rounded"
          />
          <div className="font-semibold">{item.caption}</div>
          <div className="text-xs text-gray-500">
            {item.category} {item.date}
          </div>
          <Button variant="destructive" onClick={() => deleteGaleri(item._id)}>
            Hapus
          </Button>
        </Card>
      ))}
    </div>
  );
}
