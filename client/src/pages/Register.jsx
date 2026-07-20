import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";
import { FiSearch, FiArrowLeft } from "react-icons/fi";
import { AiOutlineHome } from "react-icons/ai";
const profils = [
  { value: "locataire", label: "Je cherche un logement", icon: FiSearch },
  { value: "proprietaire", label: "Je suis propriétaire / bailleur", icon: AiOutlineHome },
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("locataire");
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    motDePasse: "",
    confirmation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.motDePasse !== form.confirmation) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    try {
      const user = await register({ ...form, role });
      navigate(user.role === "admin" ? "/admin" : "/accueil");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--nk-cream)",
        padding: "clamp(20px, 4vw, 28px)",
      }}
      className="register-container"
    >
      <div className="card" style={{ width: "100%", maxWidth: "min(100%, 460px)", padding: "clamp(20px, 4vw, 40px)", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Logo size={44} />
        </div>

        {step === 1 && (
          <>
            <h2 style={{ textAlign: "center", fontSize: "clamp(20px, 4vw, 24px)" }}>Quel est votre profil ?</h2>
            <p style={{ textAlign: "center", marginTop: 6, marginBottom: 24 }}>
              Choisissez l'option qui vous correspond.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px, 2vw, 12px)" }}>
              {profils.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    setRole(p.value);
                    setStep(2);
                  }}
                  aria-pressed={role === p.value}
                  className="card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "16px 18px",
                    border: role === p.value ? "2px solid var(--nk-navy-900)" : "1px solid var(--nk-line)",
                    fontSize: 15,
                    fontWeight: 600,
                    background: "#fff",
                    textAlign: "left",
                  }}
                >
                  <p.icon size={24} />
                  {p.label}
                </button>
              ))}
            </div>
            <p style={{ textAlign: "center", marginTop: 22, fontSize: 14 }}>
              Déjà inscrit ?{" "}
              <Link to="/connexion" style={{ color: "var(--nk-sky-500)", fontWeight: 600 }}>
                Se connecter
              </Link>
            </p>
          </>
        )}

        {step === 2 && (
          <form onSubmit={submit}>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ background: "none", border: "none", color: "var(--nk-ink-soft)", marginBottom: 12, display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <FiArrowLeft size={16} /> Retour
            </button>
            <h2 style={{ fontSize: 24 }}>Créer votre compte</h2>
            <p style={{ marginTop: 6, marginBottom: 20 }}>
              Profil sélectionné : <strong>{profils.find((p) => p.value === role)?.label}</strong>
            </p>

            {error && (
              <div
                style={{
                  background: "#fdecea",
                  color: "var(--nk-danger)",
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: 14,
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div className="field" style={{ flex: 1, minWidth: 180 }}>
                <label htmlFor="nom">Nom</label>
                <input id="nom" name="nom" autoComplete="family-name" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
              </div>
              <div className="field" style={{ flex: 1, minWidth: 180 }}>
                <label htmlFor="prenom">Prénom</label>
                <input
                  id="prenom"
                  name="prenom"
                  autoComplete="given-name"
                  required
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="telephone">Téléphone</label>
              <input
                id="telephone"
                name="telephone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                placeholder="074 00 00 00"
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div className="field" style={{ flex: 1, minWidth: 180 }}>
                <label htmlFor="motDePasse">Mot de passe</label>
                <input
                  id="motDePasse"
                  name="motDePasse"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={form.motDePasse}
                  onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
                />
              </div>
              <div className="field" style={{ flex: 1, minWidth: 180 }}>
                <label htmlFor="confirmation">Confirmation</label>
                <input
                  id="confirmation"
                  name="confirmation"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={form.confirmation}
                  onChange={(e) => setForm({ ...form, confirmation: e.target.value })}
                />
              </div>
            </div>

            <button className="btn btn-primary btn-block" disabled={loading} type="submit" style={{ marginTop: 8 }}>
              {loading ? "Création..." : "Créer mon compte"}
            </button>
            <p style={{ fontSize: 12, textAlign: "center", marginTop: 12, color: "var(--nk-ink-soft)" }}>
              Une validation par SMS ou email vous sera envoyée après inscription.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
