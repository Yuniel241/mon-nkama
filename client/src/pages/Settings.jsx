import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const [profil, setProfil] = useState({ nom: user.nom, prenom: user.prenom, telephone: user.telephone });
  const [motDePasse, setMotDePasse] = useState({ ancienMotDePasse: "", nouveauMotDePasse: "" });
  const [message, setMessage] = useState("");
  const [langue, setLangue] = useState(user.langue || "fr");
  const [modeSombre, setModeSombre] = useState(user.modeSombre || false);

  const enregistrerProfil = async (e) => {
    e.preventDefault();
    const res = await api.put("/auth/me", profil);
    updateUser(res.data);
    setMessage("Profil mis à jour avec succès.");
  };

  const changerMotDePasse = async (e) => {
    e.preventDefault();
    try {
      await api.put("/auth/change-password", motDePasse);
      setMessage("Mot de passe modifié avec succès.");
      setMotDePasse({ ancienMotDePasse: "", nouveauMotDePasse: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur");
    }
  };

  const changerPreferences = async (updates) => {
    const res = await api.put("/auth/me", updates);
    updateUser(res.data);
  };

  return (
    <div className="container" style={{ padding: "36px 24px 60px", maxWidth: 640 }}>
      <h1 style={{ fontSize: 28 }}>Paramètres</h1>

      {message && (
        <div style={{ background: "var(--nk-green-100)", color: "var(--nk-green-600)", padding: "10px 14px", borderRadius: 8, marginTop: 16, fontSize: 14 }}>
          {message}
        </div>
      )}

      <div className="card" style={{ padding: 24, marginTop: 24 }}>
        <h3 style={{ fontSize: 17 }}>Modifier le profil</h3>
        <form onSubmit={enregistrerProfil} style={{ marginTop: 16 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Nom</label>
              <input value={profil.nom} onChange={(e) => setProfil({ ...profil, nom: e.target.value })} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Prénom</label>
              <input value={profil.prenom} onChange={(e) => setProfil({ ...profil, prenom: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label>Téléphone</label>
            <input value={profil.telephone} onChange={(e) => setProfil({ ...profil, telephone: e.target.value })} />
          </div>
          <button className="btn btn-primary" type="submit">Enregistrer</button>
        </form>
      </div>

      <div className="card" style={{ padding: 24, marginTop: 20 }}>
        <h3 style={{ fontSize: 17 }}>Changer le mot de passe</h3>
        <form onSubmit={changerMotDePasse} style={{ marginTop: 16 }}>
          <div className="field">
            <label>Mot de passe actuel</label>
            <input type="password" value={motDePasse.ancienMotDePasse} onChange={(e) => setMotDePasse({ ...motDePasse, ancienMotDePasse: e.target.value })} />
          </div>
          <div className="field">
            <label>Nouveau mot de passe</label>
            <input type="password" value={motDePasse.nouveauMotDePasse} onChange={(e) => setMotDePasse({ ...motDePasse, nouveauMotDePasse: e.target.value })} />
          </div>
          <button className="btn btn-primary" type="submit">Changer le mot de passe</button>
        </form>
      </div>

      <div className="card" style={{ padding: 24, marginTop: 20 }}>
        <h3 style={{ fontSize: 17 }}>Préférences</h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
          <span>Langue</span>
          <select value={langue} onChange={(e) => { setLangue(e.target.value); changerPreferences({ langue: e.target.value }); }} style={{ padding: 10, borderRadius: 8, border: "1px solid var(--nk-line)" }}>
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
          <span>Mode sombre</span>
          <input type="checkbox" checked={modeSombre} onChange={(e) => { setModeSombre(e.target.checked); changerPreferences({ modeSombre: e.target.checked }); }} />
        </div>
      </div>

      <button onClick={logout} className="btn btn-danger" style={{ marginTop: 24 }}>Déconnexion</button>
    </div>
  );
};

export default Settings;
