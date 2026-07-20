import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

const tabs = [
  { value: "en_attente", label: "En attente" },
  { value: "verifiee", label: "Vérifiées" },
  { value: "rejetee", label: "Rejetées" },
  { value: "", label: "Toutes" },
];

const Listings = () => {
  const [logements, setLogements] = useState([]);
  const [tab, setTab] = useState("en_attente");

  const load = () => api.get("/admin/logements", { params: { statut: tab || undefined } }).then((res) => {
    const normalized = (res.data || []).map(l => ({
      ...l,
      photos: Array.isArray(l.photos) ? l.photos : (typeof l.photos === 'string' ? l.photos.split(',').map(s => s.trim()).filter(Boolean) : []),
    }));
    setLogements(normalized);
  });
  useEffect(() => { load(); }, [tab]);

  const valider = async (id) => { await api.put(`/listings/${id}/valider`); load(); };
  const rejeter = async (id) => {
    const motif = prompt("Motif du rejet :");
    if (motif === null) return;
    await api.put(`/listings/${id}/rejeter`, { motif });
    load();
  };
  const supprimer = async (id) => { if (confirm("Supprimer cette annonce ?")) { await api.delete(`/listings/${id}`); load(); } };

  return (
    <div>
      <h1 style={{ fontSize: 26 }}>Gestion des annonces</h1>
      <p style={{ marginTop: 6 }}>Vérifiez et modérez les annonces publiées sur la plateforme.</p>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        {tabs.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)} className="btn btn-sm" style={{ background: tab === t.value ? "var(--nk-navy-900)" : "#fff", color: tab === t.value ? "#fff" : "var(--nk-navy-900)", border: "1.5px solid var(--nk-line)" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
        {logements.length === 0 && <p>Aucune annonce dans cette catégorie.</p>}
        {logements.map((l) => (
          <div key={l._id} className="card" style={{ padding: 16, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <img src={l.photos[0]} style={{ width: 90, height: 70, objectFit: "cover", borderRadius: 10 }} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <Link to={`/logement/${l._id}`} style={{ fontWeight: 700, color: "var(--nk-navy-900)" }}>{l.titre}</Link>
              <p style={{ fontSize: 13, marginTop: 4 }}>{l.quartier}, {l.ville} · {new Intl.NumberFormat("fr-FR").format(l.prix)} FCFA</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Par {l.proprietaire?.prenom} {l.proprietaire?.nom} ({l.proprietaire?.email})</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {l.statut !== "verifiee" && <button onClick={() => valider(l._id)} className="btn btn-primary btn-sm">Valider</button>}
              {l.statut !== "rejetee" && <button onClick={() => rejeter(l._id)} className="btn btn-outline btn-sm">Rejeter</button>}
              <button onClick={() => supprimer(l._id)} className="btn btn-danger btn-sm">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Listings;
