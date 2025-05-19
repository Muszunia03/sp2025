export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-bold mb-4">🚫 404</h1>
      <p className="text-xl mb-6">Nie znaleziono strony.</p>
      <a
        href="/"
        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
      >
        Wróć do strony głównej
      </a>
    </div>
  );
}
