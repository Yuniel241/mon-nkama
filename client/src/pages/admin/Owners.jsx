import { useState, useEffect } from "react";
import api from "../../api/axios.js";
import { FiCheckCircle } from "react-icons/fi";

const Owners = () => {
  const [proprietaires, setProprietaires] = useState([]);

  const load = () => {
    api.get("/admin/utilisateurs", { params: { role: "proprietaire" } }).then((res) => setProprietaires(res.data));
  };
  useEffect(() => { load(); }, []);

  const valider = async (id) => { await api.put(`/admin/utilisateurs/${id}/valider`); load(); };
  const suspendre = async (id) => { await api.put(`/admin/utilisateurs/${id}/suspendre`); load(); };
  const reactiver = async (id) => { await api.put(`/admin/utilisateurs/${id}/reactiver`); load(); };
  const supprimer = async (id) => { if (confirm("Supprimer ce propriétaire ?")) { await api.delete(`/admin/utilisateurs/${id}`); load(); } };

  return (
    <div>
      <h1 style={{ fontSize: 26 }}>Gestion des propriétaires</h1>
      <p style={{ marginTop: 6 }}>Validez l'identité des bailleurs pour sécuriser la plateforme.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
        {proprietaires.map((p) => (
          <div key={p._id} className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontWeight: 700, color: "var(--nk-navy-900)" }}>{p.prenom} {p.nom}</p>
              <p style={{ fontSize: 13 }}>{p.email} · {p.telephone}</p>
              <p style={{ fontSize: 12, marginTop: 4, display: "inline-flex", alignItems: "center", gap: 6 }}>
                {p.verifie ? (
                  <span style={{ color: "var(--nk-green-600)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <FiCheckCircle size={14} /> Identité vérifiée
                  </span>
                ) : (
                  <span style={{ color: "var(--nk-gold-500)", fontWeight: 700 }}>En attente de validation</span>
                )}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {!p.verifie && <button onClick={() => valider(p._id)} className="btn btn-primary btn-sm">Valider</button>}
              {p.statut === "actif" ? (
                <button onClick={() => suspendre(p._id)} className="btn btn-outline btn-sm">Suspendre</button>
              ) : (
                <button onClick={() => reactiver(p._id)} className="btn btn-outline btn-sm">Réactiver</button>
              )}
              <button onClick={() => supprimer(p._id)} className="btn btn-danger btn-sm">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Owners;
