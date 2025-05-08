"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet-defaulticon-compatibility";

const Map = ({ markers = [], center = [-7.123, 110.456], zoom = 13 }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Import CSS only on client-side
    import("leaflet/dist/leaflet.css");
    import(
      "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
    );
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-muted rounded-md">
        <div className="animate-pulse text-muted-foreground">
          Memuat peta...
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "400px", width: "100%" }}
      className="rounded-md"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.length > 0 &&
        markers.map((marker, index) => (
          <Marker key={index} position={[marker.lat, marker.lng]}>
            <Popup>
              <div className="p-1">
                <strong>{marker.nama}</strong>
                {marker.alamat && (
                  <div className="mt-1">
                    <strong>Alamat:</strong> {marker.alamat}
                  </div>
                )}
                {marker.deskripsi && (
                  <div className="mt-1">
                    <strong>Deskripsi:</strong> {marker.deskripsi}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

export default Map;
