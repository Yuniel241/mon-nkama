import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;
import { Link } from "react-router-dom";
import { FiSearch, FiCrosshair } from "react-icons/fi";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const TYPES_AUTORISES = {
  standard: ["chambre"],
  premium: ["chambre", "studio", "maison"],
  golden: ["chambre", "studio", "appartement", "maison"]
};

const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const MapPage = () => {
  const { user } = useAuth();
  const [logements, setLogements] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [mapCenter, setMapCenter] = useState([0.4162, 9.4673]);
  const [mapZoom, setMapZoom] = useState(7);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const searchInputRef = useRef(null);

  // Check if user has active subscription
  const hasActiveSubscription = user && 
    user.abonnementLocataire && 
    user.abonnementLocataire !== "aucun" &&
    new Date(user.dateFinAbonnementLocataire) > new Date();

  useEffect(() => {
    api.get("/listings", { params: { limit: 200 } }).then((res) => setLogements(res.data.logements));
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&countrycodes=ga&accept-language=fr&q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectPlace = (place) => {
    const lat = Number(place.lat);
    const lon = Number(place.lon);
    setSelectedLocation({ lat, lon, label: place.display_name });
    setMapCenter([lat, lon]);
    setMapZoom(14);
    setSearchQuery(place.display_name);
    setSearchResults([]);
  };

  const locateCurrentPosition = () => {
    if (!navigator.geolocation) {
      return alert("La géolocalisation n'est pas disponible sur votre appareil.");
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setCurrentPosition(coords);
        setMapCenter(coords);
        setMapZoom(14);
      },
      () => {
        alert("Impossible de récupérer votre position. Autorisez la géolocalisation.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="container" style={{ padding: "36px 24px 60px" }}>
      <h1 style={{ fontSize: 28 }}>Carte interactive du Gabon</h1>
      <p style={{ marginTop: 6 }}>Recherchez un lieu ou explorez les logements géolocalisés sur la carte.</p>

      <div className="card" style={{ padding: 18, marginTop: 20, maxWidth: 560, borderRadius: 24 }}>
        <label style={{ fontWeight: 700, display: "block", marginBottom: 12, color: "var(--nk-navy-900)" }}>Rechercher un lieu</label>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (searchResults[0]) handleSelectPlace(searchResults[0]);
              }
            }}
            placeholder="Glass, Libreville, Owendo..."
            style={{
              width: "100%",
              padding: "14px 52px 14px 18px",
              borderRadius: "16px",
              border: "1px solid var(--nk-line)",
              background: "#fff",
              color: "var(--nk-ink)",
              fontSize: 15,
              outline: "none",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (searchResults[0]) handleSelectPlace(searchResults[0]);
              else searchInputRef.current?.focus();
            }}
            style={{
              position: "absolute",
              right: 10,
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              background: "var(--nk-gold-500)",
              color: "var(--nk-navy-950)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 12px 24px rgba(244, 180, 0, 0.22)",
            }}
          >
            <FiSearch size={18} />
          </button>
        </div>
        {searchResults.length > 0 && (
          <div style={{ marginTop: 12, border: "1px solid var(--nk-line)", borderRadius: 16, overflow: "hidden", background: "#fff", boxShadow: "0 16px 40px rgba(15,23,42,0.06)" }}>
            {searchResults.map((place, index) => (
              <button
                key={place.place_id}
                type="button"
                onClick={() => handleSelectPlace(place)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "14px 16px",
                  border: 0,
                  background: index === 0 ? "#f8fafc" : "#fff",
                  cursor: "pointer",
                  borderBottom: index < searchResults.length - 1 ? "1px solid var(--nk-line)" : "none",
                }}
              >
                <strong style={{ color: "var(--nk-navy-900)", marginBottom: 4, display: "block" }}>{place.display_name}</strong>
                <span style={{ color: "var(--nk-ink-soft)", fontSize: 13 }}>{place.type || place.category}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, gap: 12 }}>
        <button
          type="button"
          onClick={locateCurrentPosition}
          className="btn btn-sm"
          style={{ background: "var(--nk-gold-500)", color: "var(--nk-navy-950)", border: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <FiCrosshair size={16} /> Ma position
        </button>
      </div>

      <div style={{ height: 620, borderRadius: 24, overflow: "hidden", marginTop: 24, border: "1px solid rgba(15,23,42,0.12)", boxShadow: "0 28px 70px rgba(15,23,42,0.12)" }}>
        {!user || !hasActiveSubscription ? (
          <div style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--nk-cream)",
            flexDirection: "column",
            gap: 16,
            padding: 24,
            textAlign: "center"
          }}>
            <p style={{ fontSize: 16, color: "var(--nk-ink-soft)" }}>
              {!user ? "Connectez-vous pour voir la carte interactive" : "Choisissez un abonnement pour voir la carte des logements"}
            </p>
            <Link 
              to={!user ? "/connexion" : "/paiements"}
              className="btn btn-primary"
            >
              {!user ? "Se connecter" : "Choisir un abonnement"}
            </Link>
          </div>
        ) : (
          <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%" }}>
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapController center={mapCenter} zoom={mapZoom} />
            {selectedLocation && <Marker position={[selectedLocation.lat, selectedLocation.lon]} />}
            {currentPosition && (
              <Marker position={currentPosition}>
                <Popup>Votre position</Popup>
              </Marker>
            )}
            {logements
              .filter((l) => {
                // Filter by subscription access
                if (user.abonnementLocataire && user.abonnementLocataire !== "aucun") {
                  const allowedTypes = TYPES_AUTORISES[user.abonnementLocataire] || [];
                  return l.latitude && l.longitude && allowedTypes.includes(l.type);
                }
                return false;
              })
              .map((l) => (
                <Marker key={l._id} position={[l.latitude, l.longitude]}>
                  <Popup>
                    <Link to={`/logement/${l._id}`} style={{ fontWeight: 700 }}>{l.titre}</Link>
                    <br />
                    {l.quartier}, {l.ville}
                    <br />
                    {new Intl.NumberFormat("fr-FR").format(l.prix)} FCFA
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default MapPage;
