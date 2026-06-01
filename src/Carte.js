import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Carte.css';

// Corriger les icônes Leaflet (bug webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Icône rouge pour l'arrêt le plus proche
const iconeProche = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Composant interne pour centrer la carte
function BoutonCentrer({ position }) {
  const map = useMap();
  if (!position) return null;
  return (
    <button
      className="btn-centrer"
      onClick={() => map.setView(position, 15)}
    >
      📍 Centrer sur ma position
    </button>
  );
}

// Calculer la distance entre 2 points GPS (km)
function calculerDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function Carte() {
  const [arrets, setArrets] = useState([]);
  const [positionUtilisateur, setPositionUtilisateur] = useState(null);
  const [arretProche, setArretProche] = useState(null);
  const [toisProches, setTroisProches] = useState([]);
  const DAKAR = [14.6928, -17.4467];

  // Charger les arrêts depuis Flask
  useEffect(() => {
    fetch("http://localhost:5000/arrets")
      .then(r => r.json())
      .then(data => setArrets(data))
      .catch(err => console.error("Erreur arrets :", err));
  }, []);

  // Géolocalisation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setPositionUtilisateur([
            pos.coords.latitude,
            pos.coords.longitude
          ]);
        },
        () => {
          console.log("Geolocation refusée, position par défaut");
          setPositionUtilisateur([14.7167, -17.4677]);
        }
      );
    } else {
      setPositionUtilisateur([14.7167, -17.4677]);
    }
  }, []);

  // Trouver les 3 arrêts les plus proches
  useEffect(() => {
    if (positionUtilisateur && arrets.length > 0) {
      const arretsAvecDistance = arrets.map(a => ({
        ...a,
        distance: calculerDistance(
          positionUtilisateur[0],
          positionUtilisateur[1],
          a.lat, a.lon
        )
      }));
      const tries = arretsAvecDistance.sort((a, b) => a.distance - b.distance);
      setArretProche(tries[0]);
      setTroisProches(tries.slice(0, 3));
    }
  }, [positionUtilisateur, arrets]);

  return (
    <div className="carte-container">
      <h2 className="carte-titre">Carte des arrêts</h2>

      {toisProches.length > 0 && (
        <div className="trois-proches">
          <p className="trois-proches-titre">🚏 Les 3 arrêts les plus proches :</p>
          {toisProches.map((a, index) => (
            <div key={a.id} className="arret-proche-item">
              <span className="arret-rang">#{index + 1}</span>
              <strong>{a.nom}</strong>
              <span className="arret-distance">{a.distance.toFixed(1)} km</span>
              <span className="arret-lignes">Lignes : {a.lignes.join(", ")}</span>
            </div>
          ))}
        </div>
      )}

      <MapContainer center={DAKAR} zoom={13} className="carte">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <BoutonCentrer position={positionUtilisateur} />
        {arrets.map(a => (
          <Marker
            key={a.id}
            position={[a.lat, a.lon]}
            icon={arretProche && arretProche.id === a.id ? iconeProche : new L.Icon.Default()}
          >
            <Popup>
              <strong>{a.nom}</strong><br />
              Lignes : {a.lignes.join(", ")}
            </Popup>
          </Marker>
        ))}
        {positionUtilisateur && (
          <Marker position={positionUtilisateur}>
            <Popup>Vous êtes ici</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default Carte;
