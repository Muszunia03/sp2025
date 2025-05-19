import { useEffect, useState } from "react";
import supabase from "../lib/supabase-client";

export default function AllPhotosWithImages() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllPhotos = async () => {
      const { data, error } = await supabase
        .from("photos")
        .select("id, file_path, title")
        .order("id", { ascending: false });

      if (error) {
        console.error("Błąd pobierania danych:", error);
        setLoading(false);
        return;
      }

      // Pobieranie publicznych URL-i do zdjęć
      const withUrls = await Promise.all(
        data.map(async (photo) => {
          const storage = supabase.storage.from("photos");
          const { data: urlData, error: urlError } = storage.getPublicUrl(photo.file_path);
          console.log("Public URL:", urlData?.publicUrl);


          if (urlError) {
            console.error("Błąd URL dla:", photo.file_path, urlError);
            return null;
          }

          return {
            ...photo,
            publicUrl: urlData.publicUrl,
          };
        })
      );

      const filtered = withUrls.filter((p) => p !== null);
      setPhotos(filtered);
      setLoading(false);
    };

    fetchAllPhotos();
  }, []);

  if (loading) return <p className="text-white p-4">Ładowanie zdjęć</p>;
  if (!photos.length) return <p className="text-white p-4">Brak zdjęć w tabeli.</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <h2 className="text-2xl font-bold mb-6">Twoje zdjęcia</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <div key={photo.id} className="bg-zinc-800 p-4 rounded-xl shadow-md">
            <img
              src={photo.publicUrl}
              alt={photo.title}
              className="w-full h-auto object-contain rounded-lg mb-2"
            />
            <p className="text-center text-sm text-gray-300">{photo.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
