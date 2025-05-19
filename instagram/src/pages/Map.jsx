import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Naprawa ikon Leaflet w React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const examplePhotos = [
  {
    id: 1,
    title: "Zdjęcie 1",
    position: [50.06143, 19.93658], // Kraków
  },
  {
    id: 2,
    title: "Zdjęcie 2",
    position: [52.22977, 21.01178], // Warszawa
  },
  {
    id: 3,
    title: "Zdjęcie 3",
    position: [51.10789, 17.03854], // Wrocław
  },
    {
    id: 4,
    title: "Zdjęcie 4",
    position: [50.822, 19.1187], // Wrocław
  },
  {
  id: 5,
  title: "Politechnika Śląska",
  position: [50.288, 18.677], // Gliwice
},
];

export default function Map() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Mapa Zdjęć</h1>
      <MapContainer center={[52.22977, 21.01178]} zoom={6} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {examplePhotos.map(photo => (
          <Marker key={photo.id} position={photo.position}>
            <Popup>{photo.title}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
