import { useState, useEffect, useCallback } from "react";
import api from "../api/axios.js";
import ListingCard from "../components/ListingCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import { FiFilter, FiGrid, FiList, FiCheck, FiCrosshair } from "react-icons/fi";
import { GoLocation } from "react-icons/go";
import { MdHomeWork, MdKingBed, MdDoorFront, MdApartment, MdHome, MdBeachAccess } from "react-icons/md";

const categories = [
  { value: "", label: "Tout", icon: MdHomeWork },
  { value: "chambre", label: "Chambre", icon: MdKingBed },
  { value: "studio", label: "Studio", icon: MdDoorFront },
  { value: "appartement", label: "Appartement", icon: MdApartment },
  { value: "maison", label: "Maison", icon: MdHome },
];

const locationsByProvince = {
  Estuaire: {
    Libreville: ["Glass", "Bastos", "Akanda", "Owendo"] ,
    Owendo: ["Owendo centre", "Modèle", "Port", "Aéroport"],
    Kango: ["Kango centre", "Mbioro"],
  },
  "Haut-Ogooué": {
    Franceville: ["Mpassa", "Zone 1", "Zone 2"],
    Moanda: ["Moanda centre", "Bessieux"],
  },
  "Moyen-Ogooué": {
    Lambaréné: ["Lambaréné centre", "Abanga"],
    Ndjolé: ["Ndjolé centre", "Mongomo"],
  },
  "Ogooué-Ivindo": {
    Makokou: ["Makokou centre", "Lékori"],
    Booué: ["Booué centre", "Assok"],
  },
  Ngounié: {
    Mouila: ["Mouila centre", "Trouvez"],
    Fougamou: ["Fougamou centre"],
  },
  Nyanga: {
    Tchibanga: ["Tchibanga centre"],
    Mayumba: ["Mayumba centre"],
  },
  "Ogooué-Maritime": {
    "Port-Gentil": ["Doubé", "Cité"],
    Gamba: ["Gamba centre"],
  },
  "Woleu-Ntem": {
    Oyem: ["Oyem centre", "Minvoul"],
    Mitzic: ["Mitzic centre"],
  },
};

const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const Home = () => {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [filters, setFilters] = useState({
    province: "",
    ville: "",
    quartier: "",
    budgetMin: "",
    budgetMax: "",
    pieces: "",
    meuble: false,
    internet: false,
    parking: false,
    climatisation: false,
    cuisineEquipee: false,
    animauxAutorises: false,
    disponibleImmediatement: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState("grille");
  const [logements, setLogements] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([0.4162, 9.4673]);
  const [mapZoom, setMapZoom] = useState(11);
  const [currentPosition, setCurrentPosition] = useState(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { q, type };
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== "" && v !== false) params[k] = v;
      });
      const res = await api.get("/listings", { params });
      setLogements(res.data.logements);
      setTotal(res.data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [q, type, filters]);

  useEffect(() => {
    const t = setTimeout(fetchListings, 300);
    return () => clearTimeout(t);
  }, [fetchListings]);

  const toggleFilter = (key) => setFilters((f) => ({ ...f, [key]: !f[key] }));

  const locateCurrentPosition = () => {
    if (!navigator.geolocation) {
      return alert("La géolocalisation n'est pas disponible sur votre appareil.");
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setCurrentPosition(coords);
        setMapCenter(coords);
        setMapZoom(13);
      },
      () => {
        alert("Impossible de récupérer votre position. Autorisez la géolocalisation.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div style={{ background: "var(--nk-cream)", minHeight: "100vh" }}>
      <div style={{ background: "var(--nk-navy-900)", padding: "40px 0 90px" }}>
        <div className="container">
          <h1 style={{ color: "#fff", fontSize: 30 }}>
            {user ? `Bonjour ${user.prenom}.` : "Bonjour."}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", marginTop: 6, fontSize: 16 }}>
            Que recherchez-vous aujourd'hui ?
          </p>

          <div className="nk-search-bar" style={{ marginTop: 22 }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher par ville, quartier..."
            />
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="btn btn-outline btn-sm btn-toolbar-wrap"
              style={{ border: "1.5px solid var(--nk-line)" }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <FiFilter size={16} /> Filtres
              </span>
            </button>
            <button onClick={fetchListings} className="btn btn-gold">
              Rechercher
            </button>
          </div>

          <div style={{ display: "flex", gap: "clamp(6px, 2vw, 10px)", marginTop: "clamp(16px, 3vw, 20px)", overflowX: "auto", paddingBottom: 4 }} className="scrollbar-hidden">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setType(c.value)}
                style={{
                  flexShrink: 0,
                  padding: "clamp(8px, 1.5vw, 10px) clamp(14px, 2.5vw, 18px)",
                  borderRadius: 999,
                  border: "1.5px solid " + (type === c.value ? "var(--nk-gold-500)" : "rgba(255,255,255,0.25)"),
                  background: type === c.value ? "var(--nk-gold-500)" : "rgba(255,255,255,0.08)",
                  color: type === c.value ? "var(--nk-navy-950)" : "#fff",
                  fontWeight: 600,
                  fontSize: "clamp(12px, 2vw, 13.5px)",
                  whiteSpace: "nowrap",
                  minHeight: 38,
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "clamp(4px, 1vw, 8px)" }}>
                  <c.icon size={16} />
                  <span style={{ display: "inline" }}>{c.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: -60 }}>
        {showFilters && (
          <div className="card" style={{ padding: "clamp(16px, 3vw, 22px)", marginBottom: 24, overflowX: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(clamp(140px, 45vw, 160px), 1fr))", gap: "clamp(10px, 2vw, 14px)" }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Province</label>
                <select
                  value={filters.province}
                  onChange={(e) => setFilters((f) => ({ ...f, province: e.target.value, ville: "", quartier: "" }))}
                >
                  <option value="">Sélectionner une province</option>
                  {Object.keys(locationsByProvince).map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Ville</label>
                <select
                  value={filters.ville}
                  onChange={(e) => setFilters({ ...filters, ville: e.target.value, quartier: "" })}
                  disabled={!filters.province}
                >
                  <option value="">Sélectionner une ville</option>
                  {filters.province && Object.keys(locationsByProvince[filters.province]).map((ville) => (
                    <option key={ville} value={ville}>{ville}</option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Quartier</label>
                <input
                  type="text"
                  value={filters.quartier}
                  onChange={(e) => setFilters({ ...filters, quartier: e.target.value })}
                  placeholder="Entrez un quartier"
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Budget min (FCFA)</label>
                <input
                  type="number"
                  value={filters.budgetMin}
                  onChange={(e) => setFilters({ ...filters, budgetMin: e.target.value })}
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Budget max (FCFA)</label>
                <input
                  type="number"
                  value={filters.budgetMax}
                  onChange={(e) => setFilters({ ...filters, budgetMax: e.target.value })}
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Nombre de pièces</label>
                <input
                  type="number"
                  value={filters.pieces}
                  onChange={(e) => setFilters({ ...filters, pieces: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
              {[
                ["meuble", "Meublé"],
                ["internet", "Internet disponible"],
                ["parking", "Parking"],
                ["climatisation", "Climatisation"],
                ["cuisineEquipee", "Cuisine équipée"],
                ["animauxAutorises", "Animaux autorisés"],
                ["disponibleImmediatement", "Disponible immédiatement"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => toggleFilter(key)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    border: "1.5px solid " + (filters[key] ? "var(--nk-green-600)" : "var(--nk-line)"),
                    background: filters[key] ? "var(--nk-green-100)" : "#fff",
                    color: filters[key] ? "var(--nk-green-600)" : "var(--nk-ink-soft)",
                  }}
                >
                  {filters[key] ? <FiCheck size={14} style={{ marginRight: 6 }} /> : null}
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="nk-flex-between" style={{ marginBottom: 18 }}>
          <p style={{ fontWeight: 600, color: "var(--nk-navy-900)" }}>
            {loading ? "Recherche..." : `${total} logement${total > 1 ? "s" : ""} trouvé${total > 1 ? "s" : ""}`}
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["grille", "liste", "carte"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="btn btn-sm"
                style={{
                  background: view === v ? "var(--nk-navy-900)" : "#fff",
                  color: view === v ? "#fff" : "var(--nk-navy-900)",
                  border: "1.5px solid var(--nk-line)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {v === "grille" ? <FiGrid size={16} /> : v === "liste" ? <FiList size={16} /> : <GoLocation size={16} />} {v}
              </button>
            ))}
          </div>
        </div>

          <div
            style={{
              display: view === "grille" ? "grid" : "flex",
              flexDirection: view === "liste" ? "column" : undefined,
              gridTemplateColumns: view === "grille" ? "repeat(auto-fill, minmax(280px, 1fr))" : undefined,
              gap: 20,
              paddingBottom: 60,
            }}
          >
            {logements.map((l) => (
              <ListingCard 
                key={l._id} 
                logement={l} 
                layout={view === "liste" ? "list" : "grid"}
                userSubscription={user ? {
                  pack: user.abonnementLocataire,
                  dateExpiration: user.dateFinAbonnementLocataire
                } : null}
              />
            ))}
            {!loading && logements.length === 0 && (
              <p style={{ gridColumn: "1/-1", textAlign: "center", padding: 60 }}>
                Aucun logement ne correspond à votre recherche.
              </p>
            )}
          </div>
          <>
            <div style={{ marginBottom: 12, display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={locateCurrentPosition}
                className="btn btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--nk-gold-500)", color: "var(--nk-navy-950)", border: "none" }}
              >
                <FiCrosshair size={16} /> Ma position
              </button>
            </div>
            <div style={{ height: 520, borderRadius: 16, overflow: "hidden", marginBottom: 60, border: "1px solid var(--nk-line)" }}>
              <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController center={mapCenter} zoom={mapZoom} />
                {currentPosition && (
                  <Marker position={currentPosition}>
                    <Popup>Votre position</Popup>
                  </Marker>
                )}
                {logements
                  .filter((l) => l.latitude && l.longitude)
                  .map((l) => (
                    <Marker key={l._id} position={[l.latitude, l.longitude]}>
                      <Popup>
                        <Link to={`/logement/${l._id}`} style={{ fontWeight: 700 }}>
                          {l.titre}
                        </Link>
                        <br />
                        {new Intl.NumberFormat("fr-FR").format(l.prix)} FCFA
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>
          </>
      </div>
    </div>
  );
};

export default Home;
