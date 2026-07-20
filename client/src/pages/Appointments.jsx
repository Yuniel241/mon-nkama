import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const statutColors = {
  en_attente: "var(--nk-gold-500)",
  confirmee: "var(--nk-green-600)",
  annulee: "var(--nk-danger)",
  terminee: "var(--nk-ink-soft)",
};

const Appointments = () => {
  const { user } = useAuth();
  const [rdvs, setRdvs] = useState([]);
  const [activeView, setActiveView] = useState("envoyees");

  const load = () => api.get("/appointments").then((res) => setRdvs(res.data));
  useEffect(() => { load(); }, [user]);

  const annuler = async (id) => {
    await api.put(`/appointments/${id}/annuler`);
    load();
  };

  const valider = async (id) => {
    await api.put(`/appointments/${id}/valider`);
    load();
  };

  const rejeter = async (id) => {
    await api.put(`/appointments/${id}/rejeter`);
    load();
  };

  const isOwner = (r) => user && r.logement?.proprietaire && String(r.logement.proprietaire._id) === String(user._id);
  const isRequester = (r) => user && String(r.utilisateur) === String(user._id);
  const demandesEnvoyees = rdvs.filter(isRequester);
  const demandesRecues = rdvs.filter(isOwner);

  return (
    <div className="container" style={{ padding: "36px 24px 60px" }}>
      <h1 style={{ fontSize: 28 }}>Mes rendez-vous</h1>
      <p style={{ marginTop: 6 }}>Vos visites de logements programmées.</p>

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <button
          onClick={() => setActiveView("envoyees")}
          className="btn btn-outline btn-sm"
          style={{ flex: 1, borderColor: activeView === "envoyees" ? "var(--nk-gold-500)" : undefined, background: activeView === "envoyees" ? "rgba(255, 232, 160, 0.3)" : undefined }}
        >
          Demandes envoyées
        </button>
        <button
          onClick={() => setActiveView("recues")}
          className="btn btn-outline btn-sm"
          style={{ flex: 1, borderColor: activeView === "recues" ? "var(--nk-gold-500)" : undefined, background: activeView === "recues" ? "rgba(255, 232, 160, 0.3)" : undefined }}
        >
          Demandes reçues
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20 }}>
        {activeView === "envoyees" && demandesEnvoyees.length === 0 && <p>Aucune demande envoyée.</p>}
        {activeView === "recues" && demandesRecues.length === 0 && <p>Aucune demande reçue.</p>}

        {(activeView === "envoyees" ? demandesEnvoyees : demandesRecues).map((r) => {
          const isOwner = user && r.logement?.proprietaire && String(r.logement.proprietaire._id) === String(user._id);
          const isRequester = user && String(r.utilisateur) === String(user._id);
          return (
            <div key={r._id} className="card" style={{ padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <Link to={`/logement/${r.logement?._id}`} style={{ fontWeight: 700, color: "var(--nk-navy-900)" }}>
                  {r.logement?.titre || "Logement supprimé"}
                </Link>
                <p style={{ fontSize: 13, marginTop: 4 }}>
                  {new Date(r.date).toLocaleDateString("fr-FR")} à {r.heure}
                </p>
                <p style={{ fontSize: 12, marginTop: 2, fontFamily: "monospace" }}>QR: {r.qrCode}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ color: statutColors[r.statut], fontWeight: 700, fontSize: 13, textTransform: "capitalize" }}>
                  {r.statut.replace("_", " ")}
                </span>
                {r.statut === "en_attente" && isOwner && (
                  <>
                    <button onClick={() => valider(r._id)} className="btn btn-primary btn-sm">Confirmer</button>
                    <button onClick={() => rejeter(r._id)} className="btn btn-outline btn-sm">Refuser</button>
                  </>
                )}
                {(r.statut === "en_attente" || r.statut === "confirmee") && isRequester && (
                  <button onClick={() => annuler(r._id)} className="btn btn-outline btn-sm">Annuler</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Appointments;
