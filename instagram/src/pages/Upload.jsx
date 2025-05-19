import { useState } from "react";
import supabase from "../lib/supabase-client";

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
    const { error } = await supabase.storage.from("photos").upload(filePath, file);

    if (error) {
      console.error("Upload error:", error);
      return setStatus({ type: "error", message: "Błąd: " + error.message });
    }

    const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(filePath);

    setStatus({ type: "success", message: `Sukces! Plik przesłany.` });
    console.log("Publiczny URL:", publicUrl);
  };

return (
  <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white flex items-start justify-center px-4 pt-32 font-sans">
    <div className="bg-zinc-800 p-8 rounded-3xl shadow-2xl border border-zinc-700 w-full max-w-md transition-all duration-300">
      <h2 className="text-3xl font-extrabold text-center mb-6 tracking-tight text-white">
        Dodaj Plik
      </h2>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
          }
        }}
        className="border-2 border-dashed border-zinc-500 rounded-xl p-6 mb-4 text-center cursor-pointer hover:border-purple-400 transition"
      >
        {file ? (
          <p className="text-green-400 font-medium">{file.name}</p>
        ) : (
          <p className="text-zinc-300">Przeciągnij Plik</p>
        )}
      </div>
      <label className="block mb-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer transition"
        />
      </label>
      <button
        onClick={handleUpload}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
      >
        Wyślij
      </button>
      {status && (
        <div
          className={`mt-4 text-sm rounded-lg p-3 text-center ${
            status.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  </div>
);


}
