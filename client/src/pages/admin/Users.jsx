import { useState, useEffect } from "react";
import api from "../../api/axios.js";

const roleLabels = { locataire: "Locataire", proprietaire: "Propriétaire", admin: "Admin" };

const Users = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [filtreRole, setFiltreRole] = useState("");

  const load = () => api.get("/admin/utilisateurs", { params: { role: filtreRole || undefined } }).then((res) => setUtilisateurs(res.data));
  useEffect(() => { load(); }, [filtreRole]);

  const suspendre = async (id) => { await api.put(`/admin/utilisateurs/${id}/suspendre`); load(); };
  const reactiver = async (id) => { await api.put(`/admin/utilisateurs/${id}/reactiver`); load(); };
  const supprimer = async (id) => { if (confirm("Supprimer cet utilisateur ?")) { await api.delete(`/admin/utilisateurs/${id}`); load(); } };

  return (
    <div>
      <h1 style={{ fontSize: 26 }}>Gestion des utilisateurs</h1>
      <p style={{ marginTop: 6 }}>{utilisateurs.length} utilisateur(s)</p>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        {["", "locataire", "proprietaire"].map((r) => (
          <button key={r} onClick={() => setFiltreRole(r)} className="btn btn-sm" style={{ background: filtreRole === r ? "var(--nk-navy-900)" : "#fff", color: filtreRole === r ? "#fff" : "var(--nk-navy-900)", border: "1.5px solid var(--nk-line)" }}>
            {r === "" ? "Tous" : roleLabels[r]}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginTop: 20, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: "var(--nk-navy-900)", color: "#fff" }}>
              <th style={{ padding: 12, textAlign: "left" }}>Nom</th>
              <th style={{ padding: 12, textAlign: "left" }}>Email</th>
              <th style={{ padding: 12, textAlign: "left" }}>Rôle</th>
              <th style={{ padding: 12, textAlign: "left" }}>Statut</th>
              <th style={{ padding: 12, textAlign: "left" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {utilisateurs.map((u) => (
              <tr key={u._id} style={{ borderTop: "1px solid var(--nk-line)" }}>
                <td style={{ padding: 12 }}>{u.prenom} {u.nom}</td>
                <td style={{ padding: 12 }}>{u.email}</td>
                <td style={{ padding: 12, textTransform: "capitalize" }}>{roleLabels[u.role]}</td>
                <td style={{ padding: 12 }}>
                  <span style={{ color: u.statut === "actif" ? "var(--nk-green-600)" : "var(--nk-danger)", fontWeight: 700 }}>{u.statut}</span>
                </td>
                <td style={{ padding: 12, display: "flex", gap: 6 }}>
                  {u.statut === "actif" ? (
                    <button onClick={() => suspendre(u._id)} className="btn btn-outline btn-sm">Suspendre</button>
                  ) : (
                    <button onClick={() => reactiver(u._id)} className="btn btn-outline btn-sm">Réactiver</button>
                  )}
                  <button onClick={() => supprimer(u._id)} className="btn btn-danger btn-sm">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
