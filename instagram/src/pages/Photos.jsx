import { useEffect, useState } from "react";
import supabase from "../lib/supabase-client";

export default function Photos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);

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
                    <div
                      onClick={() => setSelectedImage(url)}
                      onContextMenu={(e) => e.preventDefault()}
                      style={{
                        position: "relative",
                        width: "100%",
                        borderRadius: "8px",
                        overflow: "hidden",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      <img
                        src={url}
                        alt={photo.title}
                        draggable={false}
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                          pointerEvents: "none",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: "6px",
                          right: "6px",
                          backgroundColor: "rgba(0,0,0,0.6)",
                          color: "white",
                          fontSize: "12px",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          pointerEvents: "none",
                        }}
                      >
                        © AHAOKOK
                      </div>
                    </div>
                  )}
                    {type === "video" && (
                  <div
                    onContextMenu={(e) => e.preventDefault()}
                    style={{
                      position: "relative",
                      width: "100%",
                      borderRadius: "8px",
                      overflow: "hidden",
                      userSelect: "none",
                    }}
                  >
                    <video
                      controls
                      style={{ width: "100%", display: "block" }}
                      onContextMenu={(e) => e.preventDefault()}
                      draggable={false}
                    >
                      <source src={url} type="video/mp4" />
                    </video>
                    <div
                      style={{
                        position: "absolute",
                        bottom: "6px",
                        right: "6px",
                        backgroundColor: "rgba(0,0,0,0.6)",
                        color: "white",
                        fontSize: "12px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        pointerEvents: "none",
                      }}
                    >
                      © AHAOKOK
                    </div>
                  </div>
                )}

                {type === "audio" && (
                  <div onContextMenu={(e) => e.preventDefault()} style={{ userSelect: "none" }}>
                    <audio
                      controls
                      style={{ width: "100%" }}
                      onContextMenu={(e) => e.preventDefault()}
                      draggable={false}
                    >
                      <source src={url} type="audio/mpeg" />
                    </audio>
                  </div>
                )}

                {type === "file" && (
                  <div onContextMenu={(e) => e.preventDefault()} style={{ userSelect: "none" }}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "block",
                        color: "#4f46e5",
                        marginBottom: "8px",
                        pointerEvents: "none",
                      }}
                      draggable={false}
                    >
                      {photo.title}
                    </a>
                  </div>
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
          onContextMenu={(e) => e.preventDefault()}
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
            userSelect: "none",
          }}
        >
          <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Powiększone zdjęcie"
              draggable={false}
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                borderRadius: "10px",
                boxShadow: "0 0 20px black",
              }}
            />
            {/* Watermark */}
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                right: "10px",
                padding: "4px 10px",
                backgroundColor: "rgba(0,0,0,0.6)",
                color: "white",
                fontSize: "14px",
                borderRadius: "5px",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              © AHAOKOK
            </div>
          </div>

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
