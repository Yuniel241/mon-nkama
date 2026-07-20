import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    api.get("/messages").then((res) => setConversations(res.data));
  }, []);

  return (
    <div className="container" style={{ padding: "36px 24px 60px", maxWidth: 720 }}>
      <h1 style={{ fontSize: 28 }}>Messagerie</h1>
      <p style={{ marginTop: 6 }}>Vos échanges sécurisés avec les propriétaires et locataires.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 26 }}>
        {conversations.length === 0 && <p>Aucune conversation pour le moment.</p>}
        {conversations.map((c) => {
          const autre = c.participants.find((p) => p._id !== user._id);
          const dernierMsg = c.messages[c.messages.length - 1];
          return (
            <Link key={c._id} to={`/messages/${c._id}`} className="card" style={{ padding: 16, display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--nk-navy-900)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>
                {autre?.prenom?.[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, color: "var(--nk-navy-900)" }}>{autre?.prenom} {autre?.nom}</p>
                {c.logement && <p style={{ fontSize: 12 }}>À propos de : {c.logement.titre}</p>}
                <p style={{ fontSize: 13, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {dernierMsg ? dernierMsg.contenu : "Nouvelle conversation"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Messages;
