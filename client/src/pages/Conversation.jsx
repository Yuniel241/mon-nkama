import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { FiArrowLeft } from "react-icons/fi";

const Conversation = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [texte, setTexte] = useState("");
  const bottomRef = useRef(null);

  const load = () => api.get(`/messages/${id}`).then((res) => setConversation(res.data));
  useEffect(() => { load(); }, [id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conversation]);

  const envoyer = async (e) => {
    e.preventDefault();
    if (!texte.trim()) return;
    await api.post(`/messages/${id}`, { contenu: texte, type: "texte" });
    setTexte("");
    load();
  };

  if (!conversation) return <div className="container" style={{ padding: 60 }}>Chargement...</div>;

  const autre = conversation.participants.find((p) => p._id !== user._id);

  return (
    <div className="container" style={{ padding: "24px 24px 40px", maxWidth: 720, display: "flex", flexDirection: "column", height: "calc(100vh - 72px)" }}>
      <Link to="/messages" style={{ fontSize: 13, color: "var(--nk-ink-soft)", display: "inline-flex", alignItems: "center", gap: 6 }}>
        <FiArrowLeft size={14} /> Retour aux messages
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, paddingBottom: 16, borderBottom: "1px solid var(--nk-line)" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--nk-navy-900)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
          {autre?.prenom?.[0]}
        </div>
        <p style={{ fontWeight: 700, color: "var(--nk-navy-900)" }}>{autre?.prenom} {autre?.nom}</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 4px", display: "flex", flexDirection: "column", gap: 10 }}>
        {conversation.messages.map((m) => {
          const mine = m.expediteur === user._id || m.expediteur?._id === user._id;
          return (
            <div key={m._id} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "70%" }}>
              <div style={{ background: mine ? "var(--nk-navy-900)" : "#fff", color: mine ? "#fff" : "var(--nk-ink)", padding: "10px 14px", borderRadius: 14, border: mine ? "none" : "1px solid var(--nk-line)" }}>
                {m.contenu}
              </div>
              <p style={{ fontSize: 10, marginTop: 2, textAlign: mine ? "right" : "left" }}>
                {new Date(m.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={envoyer} style={{ display: "flex", gap: 10, paddingTop: 12, borderTop: "1px solid var(--nk-line)" }}>
        <input
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Écrire un message..."
          style={{ flex: 1, padding: "12px 16px", borderRadius: 999, border: "1.5px solid var(--nk-line)", outline: "none" }}
        />
        <button className="btn btn-primary" type="submit">Envoyer</button>
      </form>
    </div>
  );
};

export default Conversation;
