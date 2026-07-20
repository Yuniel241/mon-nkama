import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import api from "../api/axios.js";
import { FiCheck, FiCrosshair, FiAlertCircle, FiLock, FiSearch } from "react-icons/fi";

const provinceData = {
  "Estuaire": ["Libreville", "Kango", "Owendo"],
  "Haut-Ogooué": ["Franceville", "Moanda", "Leconi"],
  "Moyen-Ogooué": ["Lambaréné", "Ndjolé"],
  "Ogooué-Ivindo": ["Makokou", "Booué"],
  "Ogooué-Lolo": ["Koulamoutou", "Iboundji"],
  "Ngounié": ["Mouila", "Fougamou"],
  "Nyanga": ["Tchibanga", "Mayumba"],
  "Ogooué-Maritime": ["Port-Gentil", "Gamba"],
  "Woleu-Ntem": ["Oyem", "Mitzic"],
};

// Types autorisés par pack
const TYPES_AUTORISES = {
  standard: ["chambre"],
  premium: ["chambre", "studio", "maison"],
  golden: ["chambre", "studio", "appartement", "maison"]
};

const emptyForm = {
  titre: "",
  description: "",
  type: "chambre",
  prix: "",
  province: "",
  ville: "",
  quartier: "",
  adresse: "",
  pieces: 1,
  sallesDeBain: 1,
  meuble: false,
  internet: false,
  parking: false,
  climatisation: false,
  cuisineEquipee: false,
  animauxAutorises: false,
  disponibleImmediatement: true,
  latitude: "",
  longitude: "",
};

const LocationPicker = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const PublishListing = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [photos, setPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userSubscription, setUserSubscription] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [mapCenter, setMapCenter] = useState([0.4162, 9.4673]);
  const [mapZoom, setMapZoom] = useState(10);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Charger les infos d'abonnement
  useEffect(() => {
    const fetchUserSubscription = async () => {
      try {
        // Récupérer les infos de l'utilisateur connecté via un endpoint
        // Alternativement, on peut décoder le token JWT
        const response = await api.get("/auth/me"); // À créer si n'existe pas
        if (response.data) {
          setUserSubscription({
            pack: response.data.abonnementProprietaire,
            dateExpiration: response.data.dateFinAbonnementProprietaire
          });
        }
      } catch (err) {
        // Si l'endpoint n'existe pas, on va juste vérifier à l'envoi
        console.error("Erreur lors du chargement de l'abonnement:", err);
      }
    };
    
    if (!isEdit) {
      fetchUserSubscription();
    }
  }, [isEdit]);

  useEffect(() => {
    if (isEdit) {
      api.get(`/listings/${id}`).then((res) => {
        const data = res.data;
        data.photos = Array.isArray(data.photos) ? data.photos : (typeof data.photos === 'string' ? data.photos.split(',').map(s => s.trim()).filter(Boolean) : []);
        setForm({ ...data });
        setExistingPhotos(data.photos || []);
      });
    } else if (userSubscription?.pack && userSubscription.pack !== "aucun") {
      // Prédéfinir le type selon le pack disponible
      const typesAutorises = TYPES_AUTORISES[userSubscription.pack];
      if (typesAutorises && typesAutorises.length > 0) {
        setForm(f => ({ ...f, type: typesAutorises[0] }));
      }
    }
  }, [id, isEdit, userSubscription]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => performSearch(searchQuery), 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (q) => {
    if (!q || q.trim().length < 2) return setSearchResults([]);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&addressdetails=1&countrycodes=ga&accept-language=fr&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      setSearchResults([]);
    }
  };

  const handleLocationSelect = (lat, lng) => {
    update("latitude", lat.toFixed(6));
    update("longitude", lng.toFixed(6));
  };

  const handlePlaceSelect = (place) => {
    const lat = Number(place.lat);
    const lon = Number(place.lon);
    handleLocationSelect(lat, lon);
    setMapCenter([lat, lon]);
    setMapZoom(16);
    setSearchQuery(place.display_name);
    setSearchResults([]);

    const address = place.address || {};
    const city = address.city || address.town || address.village || address.county || "";
    const province = address.state || address.county || "";
    const quartier = address.suburb || address.neighbourhood || address.quarter || address.hamlet || "";

    if (province) update("province", province);
    if (city) update("ville", city);
    if (quartier && !form.quartier) update("quartier", quartier);
    if (!form.adresse) update("adresse", place.display_name.split(",")[0]);
  };

  const locateCurrentPosition = () => {
    if (!navigator.geolocation) {
      return alert("La géolocalisation n'est pas disponible sur votre appareil.");
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        handleLocationSelect(lat, lng);
        setMapCenter([lat, lng]);
        setMapZoom(16);
        setCurrentLocation([lat, lng]);
      },
      () => {
        alert("Impossible de récupérer votre position. Autorisez la géolocalisation.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!isEdit && photos.length === 0) {
      setError("Veuillez ajouter au moins une photo.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        // Skip sending the existing `photos` array as a form field —
        // appending it turns it into a comma-joined string which the server saves incorrectly.
        if (k === 'photos') return;

        // Avoid appending nested proprietaire object which causes Mongoose ObjectId cast errors
        if (k === 'proprietaire') {
          if (!v) return;
          if (typeof v === 'object' && v._id) {
            fd.append('proprietaire', v._id);
          }
          return;
        }

        if (v !== undefined && v !== null) fd.append(k, v);
      });
      photos.forEach((p) => fd.append('photos', p));

      if (isEdit) {
        await api.put(`/listings/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("/listings", fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
      navigate("/mes-annonces");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Erreur lors de la publication";
      setError(errorMsg);
      
      // Si erreur d'abonnement, proposer redirection
      if (err.response?.data?.redirect) {
        setTimeout(() => navigate(err.response.data.redirect), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const isTypeDisabled = (typeOption) => {
    if (isEdit) return false; // Pas de restriction en édition
    if (!userSubscription?.pack || userSubscription.pack === "aucun") return true;
    
    const authorized = TYPES_AUTORISES[userSubscription.pack] || [];
    return !authorized.includes(typeOption);
  };

  const isSubscriptionActive = userSubscription?.pack && 
    userSubscription.pack !== "aucun" && 
    userSubscription.dateExpiration && 
    new Date(userSubscription.dateExpiration) > new Date();

  return (
    <div className="container" style={{ padding: "clamp(24px, 5vw, 36px) clamp(16px, 5vw, 24px) 60px", maxWidth: "min(100%, 720px)" }}>
      <h1 style={{ fontSize: "clamp(24px, 5vw, 28px)" }}>{isEdit ? "Modifier l'annonce" : "Publier une annonce"}</h1>
      
      {!isEdit && !isSubscriptionActive && (
        <div style={{ 
          background: "#fef3c7", 
          border: "1px solid #fbbf24", 
          borderRadius: 8, 
          padding: 14, 
          marginTop: 16,
          display: "flex",
          gap: 12,
          alignItems: "flex-start"
        }}>
          <FiAlertCircle size={20} style={{ color: "#b45309", marginTop: 2, flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 600, color: "#b45309", marginBottom: 4 }}>
              Abonnement propriétaire requis
            </p>
            <p style={{ fontSize: 13, color: "#92400e" }}>
              Vous devez avoir un abonnement actif pour publier une annonce.
            </p>
            <button
              type="button"
              onClick={() => navigate("/paiements")}
              style={{
                marginTop: 10,
                padding: "8px 16px",
                background: "#b45309",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer"
              }}
            >
              Choisir un pack propriétaire
            </button>
          </div>
        </div>
      )}

      {!isEdit && isSubscriptionActive && (
        <div style={{ 
          background: "#ecfdf5", 
          border: "1px solid #6ee7b7", 
          borderRadius: 8, 
          padding: 12, 
          marginTop: 16,
          fontSize: 13,
          color: "#065f46"
        }}>
          ✓ Vous avez un pack <strong>{userSubscription.pack}</strong> actif jusqu'au {new Date(userSubscription.dateExpiration).toLocaleDateString("fr-FR")}
        </div>
      )}

      {error && (
        <div style={{ background: "#fdecea", color: "var(--nk-danger)", padding: "10px 14px", borderRadius: 8, marginTop: 16, fontSize: 14, display: "flex", gap: 8 }}>
          <FiAlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={submit} className="card" style={{ padding: 24, marginTop: 20 }}>
        <div className="field">
          <label>Titre de l'annonce</label>
          <input required value={form.titre} onChange={(e) => update("titre", e.target.value)} placeholder="Bel appartement meublé à Glass" />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea required value={form.description} onChange={(e) => update("description", e.target.value)} style={{ minHeight: 110, padding: 12, borderRadius: 8, border: "1.5px solid var(--nk-line)" }} />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Type de logement</label>
            <select 
              value={form.type} 
              onChange={(e) => update("type", e.target.value)}
              disabled={!isEdit && (!isSubscriptionActive || !userSubscription?.pack)}
            >
              {['chambre', 'studio', 'appartement', 'maison'].map((t) => {
                const disabled = isTypeDisabled(t);
                const authorized = !isEdit && userSubscription?.pack ? TYPES_AUTORISES[userSubscription.pack] || [] : [];
                
                return (
                  <option key={t} value={t} disabled={disabled}>
                    {t}{disabled && !isEdit ? ` (${userSubscription?.pack || 'non'} plan)` : ""}
                  </option>
                );
              })}
            </select>
            {!isEdit && userSubscription?.pack && userSubscription.pack !== "aucun" && TYPES_AUTORISES[userSubscription.pack] && (
              <p style={{ fontSize: 12, color: "var(--nk-ink-soft)", marginTop: 6 }}>
                Votre pack <strong>{userSubscription.pack}</strong> autorise: {TYPES_AUTORISES[userSubscription.pack].join(", ")}
              </p>
            )}
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Prix mensuel (FCFA)</label>
            <input type="number" required value={form.prix} onChange={(e) => update("prix", e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, minWidth: 180 }}>
            <label>Province</label>
            <select required value={form.province} onChange={(e) => { update("province", e.target.value); update("ville", ""); }}>
              <option value="">Sélectionner une province</option>
              {Object.keys(provinceData).map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1, minWidth: 180 }}>
            <label>Ville</label>
            <select required value={form.ville} onChange={(e) => update("ville", e.target.value)} disabled={!form.province}>
              <option value="">Sélectionner une ville</option>
              {(provinceData[form.province] || []).map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label>Quartier</label>
          <input required value={form.quartier} onChange={(e) => update("quartier", e.target.value)} placeholder="Glass" />
        </div>
        <div className="field">
          <label>Adresse (optionnel)</label>
          <input value={form.adresse} onChange={(e) => update("adresse", e.target.value)} />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Nombre de pièces</label>
            <input type="number" min="1" value={form.pieces} onChange={(e) => update("pieces", e.target.value)} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Salles de bain</label>
            <input type="number" min="0" value={form.sallesDeBain} onChange={(e) => update("sallesDeBain", e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Lieu sur la carte</label>
          <p style={{ fontSize: 13, color: "var(--nk-ink-soft)", marginTop: 4 }}>Recherchez un lieu, puis cliquez sur la carte pour ajuster la position. Les coordonnées seront enregistrées automatiquement.</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ex. Glass, Libreville, Owendo"
              style={{ flex: 1 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  performSearch(searchQuery);
                }
              }}
            />
            <button
              type="button"
              onClick={() => performSearch(searchQuery)}
              title="Rechercher"
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--nk-line)", background: "#fff", cursor: "pointer" }}
            >
              <FiSearch size={16} />
            </button>
          </div>
          <button
            type="button"
            onClick={locateCurrentPosition}
            style={{
              marginTop: 10,
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid var(--nk-line)",
              background: "#fff",
              color: "var(--nk-navy-900)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <FiCrosshair size={16} /> Ma position actuelle
          </button>
          {searchResults.length > 0 && (
            <div style={{ marginTop: 8, border: "1px solid var(--nk-line)", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
              {searchResults.map((place) => (
                <button
                  key={place.place_id}
                  type="button"
                  onClick={() => handlePlaceSelect(place)}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 12px", border: 0, background: "#fff", cursor: "pointer", borderBottom: "1px solid var(--nk-line)" }}
                >
                  {place.display_name}
                </button>
              ))}
            </div>
          )}
          <div style={{ height: 260, borderRadius: 12, overflow: "hidden", border: "1px solid var(--nk-line)", marginTop: 8 }}>
            <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapController center={mapCenter} zoom={mapZoom} />
              <LocationPicker onSelect={handleLocationSelect} />
              {form.latitude && form.longitude && <Marker position={[Number(form.latitude), Number(form.longitude)]} />}
            </MapContainer>
          </div>
          <input value={`${form.latitude || ""}, ${form.longitude || ""}`} readOnly style={{ background: "var(--nk-cream)", marginTop: 8 }} />
        </div>

        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--nk-navy-900)" }}>Équipements</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10, marginBottom: 20 }}>
          {[
            ["meuble", "Meublé"],
            ["internet", "Internet"],
            ["parking", "Parking"],
            ["climatisation", "Climatisation"],
            ["cuisineEquipee", "Cuisine équipée"],
            ["animauxAutorises", "Animaux autorisés"],
            ["disponibleImmediatement", "Disponible immédiatement"],
          ].map(([key, label]) => (
            <button
              type="button"
              key={key}
              onClick={() => update(key, !form[key])}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                border: "1.5px solid " + (form[key] ? "var(--nk-green-600)" : "var(--nk-line)"),
                background: form[key] ? "var(--nk-green-100)" : "#fff",
                color: form[key] ? "var(--nk-green-600)" : "var(--nk-ink-soft)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {form[key] ? <FiCheck size={14} /> : null}{label}
            </button>
          ))}
        </div>

        {existingPhotos.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Photos actuelles</label>
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {existingPhotos.map((p, i) => <img key={i} src={p} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />)}
            </div>
          </div>
        )}

        <div className="field">
          <label>{isEdit ? "Ajouter des photos" : "Photos du logement"}</label>
          <input type="file" multiple accept="image/*" onChange={(e) => setPhotos(Array.from(e.target.files).slice(0, 10))} />
          <p style={{ fontSize: 12, color: "var(--nk-ink-soft)", marginTop: 6 }}>Maximum 10 images par annonce.</p>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-block" 
          disabled={loading || (!isEdit && !isSubscriptionActive)}
        >
          {loading ? "Publication..." : isEdit ? "Enregistrer les modifications" : "Publier l'annonce"}
        </button>
      </form>
    </div>
  );
};

export default PublishListing;
