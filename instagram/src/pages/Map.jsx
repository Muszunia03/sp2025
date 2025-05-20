import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import supabase from "../lib/supabase-client";
import exifr from "exifr";

// Naprawa ikon Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapWithMetadata() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotosWithMetadata = async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setLoading(false);
        return;
      }

      const { data: photoList, error } = await supabase
        .from("photos")
        .select("*")
        .eq("user_id", userData.user.id);

      if (error) {
        console.error("Błąd pobierania zdjęć:", error);
        setLoading(false);
        return;
      }

      const imageExtensions = ["jpg", "jpeg", "png", "webp", "gif"];

      const enrichedPhotos = await Promise.all(
        photoList
          .filter(photo => {
            const ext = photo.title.split(".").pop().toLowerCase();
            return imageExtensions.includes(ext);
          })
          .map(async (photo) => {
            const { data } = supabase.storage.from("photos").getPublicUrl(photo.file_path);
            const url = data?.publicUrl;

            try {
              const exifData = await exifr.parse(url, { gps: true });
              return {
                ...photo,
                url,
                metadata: {
                  date: exifData?.DateTimeOriginal || null,
                  lat: exifData?.latitude,
                  lng: exifData?.longitude,
                },
              };
            } catch (err) {
              console.warn("Nie udało się pobrać EXIF dla", photo.title, err);
              return {
                ...photo,
                url,
                metadata: null,
              };
            }
          })
      );

      setPhotos(enrichedPhotos);
      setLoading(false);
    };

    fetchPhotosWithMetadata();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Mapa Zdjęć z Metadanymi</h1>

      <MapContainer
        center={[52.22977, 21.01178]}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: "600px", width: "100%" }} 
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {photos
          .filter((p) => p.metadata?.lat && p.metadata?.lng)
          .map((photo) => {
            const icon = new L.Icon({
              iconUrl: photo.url,
              iconSize: [40, 40], 
              iconAnchor: [20, 40], 
            });

            return (
              <Marker
                key={photo.id}
                position={[photo.metadata.lat, photo.metadata.lng]}
                icon={icon}
              >
                <Popup>{photo.title}</Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}
