import { useState } from "react";
import supabase from "../lib/supabase-client";
import styles from "../styles/upload.module.css";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);

  const handleUpload = async () => {
    setStatus(null);
    if (!file) return setStatus({ type: "error", message: "Wybierz plik!" });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Brak użytkownika:", userError);
      return setStatus({ type: "error", message: "Musisz być zalogowany." });
    }

    const filePath = `${user.id}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return setStatus({ type: "error", message: "Błąd: " + uploadError.message });
    }

    const { error: insertError } = await supabase.from("photos").insert([
      {
        user_id: user.id,
        file_path: filePath,
        title: file.name,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      console.error("Błąd zapisu do bazy:", insertError);
      return setStatus({ type: "error", message: "Nie udało się zapisać danych do bazy." });
    }

    setStatus({ type: "success", message: `Sukces! Plik przesłany.` });
    setFile(null);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dodaj plik</h1>

      <div
        className={styles.dropzone}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
          }
        }}
      >
        {file ? (
          <p className={styles.fileName}>{file.name}</p>
        ) : (
          <p className={styles.filePlaceholder}>Przeciągnij plik tutaj</p>
        )}
      </div>

      <label className={styles.inputLabel}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className={styles.fileInput}
        />
      </label>

      <button onClick={handleUpload} className={styles.button}>
        Wyślij
      </button>

      {status && (
        <div className={`${styles.status} ${styles[status.type]}`}>
          {status.message}
        </div>
      )}
    </div>
  );
}
