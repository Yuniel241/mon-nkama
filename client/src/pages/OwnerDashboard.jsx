import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

const statutLabels = {
  en_attente: { label: "En attente", color: "var(--nk-gold-500)" },
  verifiee: { label: "Vérifiée", color: "var(--nk-green-600)" },
  rejetee: { label: "Rejetée", color: "var(--nk-danger)" },
  expiree: { label: "Expirée", color: "var(--nk-ink-soft)" },
};

const OwnerDashboard = () => {
  const [logements, setLogements] = useState([]);

  const load = () => api.get("/listings/mine").then((res) => {
    const normalized = (res.data || []).map(l => ({
      ...l,
      photos: Array.isArray(l.photos) ? l.photos : (typeof l.photos === 'string' ? l.photos.split(',').map(s => s.trim()).filter(Boolean) : []),
    }));
    setLogements(normalized);
  });
  useEffect(() => { load(); }, []);

  const supprimer = async (id) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    await api.delete(`/listings/${id}`);
    load();
  };

  return (
    <div className="container" style={{ padding: "36px 24px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "clamp(8px, 2vw, 12px)", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: 28 }}>Mes annonces</h1>
          <p style={{ marginTop: 6 }}>Gérez vos publications depuis votre tableau de bord.</p>
        </div>
        <Link to="/publier" className="btn btn-primary">+ Publier une annonce</Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 28 }}>
        {logements.length === 0 && <p>Vous n'avez pas encore publié d'annonce.</p>}
        {logements.map((l) => (
          <div key={l._id} className="card" style={{ padding: "clamp(12px, 3vw, 16px)", display: "flex", gap: "clamp(12px, 3vw, 16px)", alignItems: "center", flexWrap: "wrap", width: "100%" }}>
            <img src={l.photos[0] ? (import.meta.env.VITE_API_URL.replace('/api','') + '/' + String(l.photos[0]).replace(/^\/+/, '')) : ''} style={{ width: "clamp(70px, 20vw, 90px)", height: "clamp(54px, 15vw, 70px)", objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: "clamp(140px, 40vw, 180px)" }}>
              <Link to={`/logement/${l._id}`} style={{ fontWeight: 700, color: "var(--nk-navy-900)" }}>{l.titre}</Link>
              <p style={{ fontSize: 13, marginTop: 4 }}>{l.quartier}, {l.ville} · {new Intl.NumberFormat("fr-FR").format(l.prix)} FCFA</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>{l.vues} vue{l.vues > 1 ? "s" : ""}</p>
            </div>
            <span style={{ color: statutLabels[l.statut]?.color, fontWeight: 700, fontSize: 13 }}>
              {statutLabels[l.statut]?.label || l.statut}
            </span>
            <div style={{ display: "flex", gap: "clamp(6px, 2vw, 8px)", flexWrap: "wrap", minWidth: "100%" }}>
              <Link to={`/publier/${l._id}`} className="btn btn-outline btn-sm">Modifier</Link>
              <button onClick={() => supprimer(l._id)} className="btn btn-danger btn-sm">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnerDashboard;
