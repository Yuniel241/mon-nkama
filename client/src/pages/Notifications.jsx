import { useState, useEffect } from "react";
import api from "../api/axios.js";
import { AiOutlineHome, AiOutlineDollarCircle, AiOutlineCalendar } from "react-icons/ai";
import { FiMessageSquare, FiBell } from "react-icons/fi";

const icons = {
  nouvelle_annonce: AiOutlineHome,
  baisse_prix: AiOutlineDollarCircle,
  confirmation_visite: AiOutlineCalendar,
  annonce_expiree: FiBell,
  message: FiMessageSquare,
  systeme: FiBell,
};

const Notifications = () => {
  const [notifs, setNotifs] = useState([]);

  const load = () => api.get("/notifications").then((res) => setNotifs(res.data));
  useEffect(() => { load(); }, []);

  const marquerLu = async (id) => {
    await api.put(`/notifications/${id}/lu`);
    load();
  };

  const toutLire = async () => {
    await api.put("/notifications/tout-lire");
    load();
  };

  return (
    <div className="container" style={{ padding: "36px 24px 60px", maxWidth: 720 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 28 }}>Notifications</h1>
        <button onClick={toutLire} className="btn btn-outline btn-sm">Tout marquer comme lu</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 26 }}>
        {notifs.length === 0 && <p>Aucune notification pour le moment.</p>}
        {notifs.map((n) => {
          const Icon = icons[n.type] || FiBell;
          return (
            <div
              key={n._id}
              onClick={() => !n.lu && marquerLu(n._id)}
              className="card"
              style={{ padding: 16, display: "flex", gap: 14, alignItems: "flex-start", background: n.lu ? "#fff" : "var(--nk-sky-100)", cursor: "pointer" }}
            >
              <span style={{ fontSize: 20, display: "inline-flex", alignItems: "center" }}><Icon size={20} /></span>
              <div>
                <p style={{ fontSize: 14, fontWeight: n.lu ? 400 : 700 }}>{n.message}</p>
                {n.lien && <p style={{ fontSize: 12, color: "var(--nk-sky-500)", marginTop: 4 }}>Voir le détail</p>}
                <p style={{ fontSize: 12, marginTop: 4 }}>{new Date(n.createdAt).toLocaleString("fr-FR")}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
