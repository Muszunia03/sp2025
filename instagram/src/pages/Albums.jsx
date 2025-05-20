import { useEffect, useState } from "react";
import supabase from "../lib/supabase-client";
import exifr from "exifr";

export default function Albums() {
  const [albums, setAlbums] = useState({});
  const [loading, setLoading] = useState(true);

  // Dozwolone rozszerzenia plików zdjęć
  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"];

  const isImageFile = (filename) => {
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  useEffect(() => {
    const fetchAndGroupPhotos = async () => {
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

      const enrichedPhotos = await Promise.all(
        photoList
          .filter(photo => isImageFile(photo.file_path)) // 🔒 tylko zdjęcia
          .map(async (photo) => {
            const { data } = supabase.storage.from("photos").getPublicUrl(photo.file_path);
            const url = data?.publicUrl;

            let date;

            try {
              const exif = await exifr.parse(url);
              date = exif?.DateTimeOriginal || null;
            } catch (err) {
              console.warn("Nie udało się pobrać EXIF dla", photo.title, err);
            }

            // Jeśli brak EXIF daty, użyj daty z bazy
            const finalDate = date ? new Date(date) : new Date(photo.created_at);
            const albumKey = finalDate.toISOString().split("T")[0]; // YYYY-MM-DD

            return { ...photo, url, albumKey };
          })
      );

      // Grupowanie po dacie
      const grouped = {};
      enrichedPhotos.forEach((photo) => {
        if (!grouped[photo.albumKey]) {
          grouped[photo.albumKey] = [];
        }
        grouped[photo.albumKey].push(photo);
      });

      setAlbums(grouped);
      setLoading(false);
    };

    fetchAndGroupPhotos();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Albumy wg daty</h1>
      {loading ? (
        <p>Ładowanie...</p>
      ) : (
        Object.entries(albums).map(([date, photos]) => (
          <div key={date} style={{ marginBottom: "30px" }}>
            <h2>{date}</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {photos.map((photo) => (
                <div key={photo.id} style={{ textAlign: "center" }}>
                  <img
                    src={photo.url}
                    alt={photo.title}
                    style={{
                      maxWidth: "150px",
                      borderRadius: "8px",
                      objectFit: "cover"
                    }}
                  />
                  <p style={{ fontSize: "14px" }}>{photo.title}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
