import { useEffect, useState } from "react";
import supabase from "../lib/supabase-client";

export default function Photos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null); // <-- dodane

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error("Błąd pobierania użytkownika:", userError);
        setLoading(false);
        return;
      }

      const userId = userData.user.id;

      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Błąd pobierania zdjęć:", error.message);
      } else {
        setPhotos(data);
      }

      setLoading(false);
    };

    fetchPhotos();
  }, []);

  const getPublicUrl = (filePath) => {
    const { data } = supabase.storage.from("photos").getPublicUrl(filePath);
    return data?.publicUrl;
  };

  const getMediaType = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
    if (["mp4", "webm", "mov", "ogg"].includes(ext)) return "video";
    if (["mp3", "wav", "ogg", "m4a"].includes(ext)) return "audio";
    return "file";
  };

  const handleDelete = async (photoId, filePath) => {
    const confirmDelete = window.confirm("Czy na pewno chcesz usunąć ten plik?");
    if (!confirmDelete) return;

    const { error: storageError } = await supabase.storage.from("photos").remove([filePath]);
    if (storageError) {
      console.error("Błąd usuwania ze storage:", storageError);
      return;
    }

    const { error: dbError } = await supabase.from("photos").delete().eq("id", photoId);
    if (dbError) {
      console.error("Błąd usuwania z bazy danych:", dbError);
      return;
    }

    setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  };

  const filteredPhotos = photos.filter((photo) => {
    const type = getMediaType(photo.title);
    return filter === "all" || filter === type;
  });

  const filters = [
    { label: "Wszystkie", value: "all" },
    { label: "Zdjęcia", value: "image" },
    { label: "Wideo", value: "video" },
    { label: "Audio", value: "audio" },
    { label: "Inne", value: "file" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>Twoje pliki</h1>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {filters.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #555",
              backgroundColor: filter === value ? "#4f46e5" : "transparent",
              color: filter === value ? "white" : "#aaa",
              cursor: "pointer",
              transition: "0.2s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Ładowanie...</p>
      ) : filteredPhotos.length === 0 ? (
        <p>Brak plików w tej kategorii.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredPhotos.map((photo) => {
            const url = getPublicUrl(photo.file_path);
            const type = getMediaType(photo.title);

            return (
              <div key={photo.id} style={{ textAlign: "center" }}>
                {type === "image" && (
                  <img
                    src={url}
                    alt={photo.title}
                    style={{ width: "100%", borderRadius: "8px", cursor: "pointer" }}
                    onClick={() => setSelectedImage(url)}
                  />
                )}
                {type === "video" && (
                  <video controls style={{ width: "100%", borderRadius: "8px" }}>
                    <source src={url} type="video/mp4" />
                  </video>
                )}
                {type === "audio" && (
                  <audio controls style={{ width: "100%" }}>
                    <source src={url} type="audio/mpeg" />
                  </audio>
                )}
                {type === "file" && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", color: "#4f46e5", marginBottom: "8px" }}
                  >
                    {photo.title}
                  </a>
                )}
                <p style={{ fontSize: "14px", marginTop: "4px", color: "#aaa" }}>
                  {photo.title}
                </p>
                <button
                  onClick={() => handleDelete(photo.id, photo.file_path)}
                  style={{
                    marginTop: "8px",
                    backgroundColor: "#e11d48",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Usuń
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <img
            src={selectedImage}
            alt="Powiększone zdjęcie"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "10px",
              boxShadow: "0 0 20px black",
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setSelectedImage(null)}
            style={{
              position: "absolute",
              top: "20px",
              right: "30px",
              fontSize: "32px",
              color: "white",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
