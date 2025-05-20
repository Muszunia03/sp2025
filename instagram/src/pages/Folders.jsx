export default function Folders() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Foldery</h1>

      <div style={{ marginTop: "30px" }}>
        <h2>Prywatne Foldery</h2>
        <div
          style={{
            border: "2px dashed #ccc",
            padding: "20px",
            borderRadius: "10px",
            marginTop: "10px",
            textAlign: "center",
            color: "#888",
          }}
        >
          <p>Brak folderów prywatnych (placeholder)</p>
        </div>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h2>Publiczne Foldery</h2>
        <div
          style={{
            border: "2px dashed #ccc",
            padding: "20px",
            borderRadius: "10px",
            marginTop: "10px",
            textAlign: "center",
            color: "#888",
          }}
        >
          <p>Brak folderów publicznych (placeholder)</p>
        </div>
      </div>
    </div>
  );
}
