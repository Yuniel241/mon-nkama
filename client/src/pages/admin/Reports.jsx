import { useState, useEffect } from "react";
import api from "../../api/axios.js";

const Reports = () => {
  const [reports, setReports] = useState([]);

  const load = () => api.get("/reports").then((res) => setReports(res.data));
  useEffect(() => { load(); }, []);

  const changerStatut = async (id, statut) => { await api.put(`/reports/${id}`, { statut }); load(); };

  return (
    <div>
      <h1 style={{ fontSize: 26 }}>Signalements</h1>
      <p style={{ marginTop: 6 }}>Signalements d'arnaques ou de contenus non conformes.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
        {reports.length === 0 && <p>Aucun signalement.</p>}
        {reports.map((r) => (
          <div key={r._id} className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div>
                <p style={{ fontWeight: 700 }}>{r.motif}</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>
                  Signalé par {r.utilisateur?.prenom} {r.utilisateur?.nom} ({r.utilisateur?.email})
                </p>
                {r.logement && <p style={{ fontSize: 13 }}>Annonce concernée : {r.logement.titre}</p>}
                {r.details && <p style={{ fontSize: 13, marginTop: 4 }}>{r.details}</p>}
              </div>
              <span style={{ fontWeight: 700, fontSize: 13, textTransform: "capitalize", color: r.statut === "nouveau" ? "var(--nk-danger)" : "var(--nk-green-600)" }}>
                {r.statut}
              </span>
            </div>
            {r.statut === "nouveau" && (
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={() => changerStatut(r._id, "traite")} className="btn btn-primary btn-sm">Marquer comme traité</button>
                <button onClick={() => changerStatut(r._id, "ignore")} className="btn btn-outline btn-sm">Ignorer</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
