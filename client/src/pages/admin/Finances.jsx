import { useState, useEffect } from "react";
import api from "../../api/axios.js";

const mois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

const Finances = () => {
  const [data, setData] = useState(null);

  useEffect(() => { api.get("/admin/dashboard").then((res) => setData(res.data)); }, []);
  if (!data) return <p>Chargement...</p>;

  const max = Math.max(1, ...data.revenusParMois.map((r) => r.total));

  return (
    <div>
      <h1 style={{ fontSize: 26 }}>Tableau de bord financier</h1>
      <p style={{ marginTop: 6 }}>Suivi des revenus générés par les abonnements Standard, Premium et Golden.</p>

      <div className="card" style={{ padding: 24, marginTop: 24 }}>
        <h3 style={{ fontSize: 17 }}>Évolution mensuelle des revenus</h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200, marginTop: 24 }}>
          {data.revenusParMois.length === 0 && <p>Aucune donnée pour le moment.</p>}
          {data.revenusParMois.map((r, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: "100%", background: "var(--nk-green-500)", borderRadius: "6px 6px 0 0", height: `${(r.total / max) * 160}px` }} />
              <span style={{ fontSize: 11 }}>{mois[r._id.mois - 1]}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 16, marginTop: 20 }}>
        {data.revenusTotal.map((r) => (
          <div key={r._id} className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 12, textTransform: "capitalize", fontWeight: 600 }}>{r._id}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: "var(--nk-green-600)", marginTop: 6 }}>
              {new Intl.NumberFormat("fr-FR").format(r.total)} FCFA
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Finances;
