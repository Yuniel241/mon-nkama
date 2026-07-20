import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";
import { FiArrowRight } from "react-icons/fi";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", motDePasse: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.motDePasse);
      navigate(user.role === "admin" ? "/admin" : "/accueil");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex" }} className="login-container">
      <div
        style={{
          flex: 1,
          background: "var(--nk-navy-900)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "clamp(40px, 6vw, 60px)",
        }}
        className="nk-auth-side"
      >
        <Logo size={48} light />
        <h2 style={{ color: "#fff", fontSize: "clamp(24px, 5vw, 34px)", marginTop: "clamp(28px, 4vw, 40px)", maxWidth: 360 }}>
          Le tiers de confiance entre propriétaires et locataires.
        </h2>
        <p style={{ color: "rgba(255,255,255,0.65)", marginTop: "clamp(12px, 2vw, 16px)", maxWidth: 340, fontSize: "clamp(14px, 2vw, 15px)" }}>
          Des annonces vérifiées, un accompagnement sécurisé, partout au Gabon.
        </p>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(24px, 5vw, 32px)", minWidth: 0 }}>
        <form onSubmit={submit} style={{ width: "100%", maxWidth: "min(100%, 380px)" }}>
          <h2 style={{ fontSize: "clamp(24px, 5vw, 28px)" }}>Bon retour !</h2>
          <p style={{ marginTop: "clamp(6px, 1.5vw, 8px)", marginBottom: "clamp(18px, 3vw, 28px)", fontSize: "clamp(14px, 2vw, 15px)" }}>Connectez-vous pour continuer votre recherche.</p>

          {error && (
            <div
              style={{
                background: "#fdecea",
                color: "var(--nk-danger)",
                padding: "clamp(10px, 2vw, 14px)",
                borderRadius: 8,
                fontSize: "clamp(13px, 2vw, 14px)",
                marginBottom: "clamp(12px, 2vw, 16px)",
              }}
            >
              {error}
            </div>
          )}

          <div className="field">
            <label style={{ fontSize: "clamp(13px, 2vw, 14px)", fontWeight: 500 }}>Adresse email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="vous@exemple.com"
              style={{ fontSize: "clamp(14px, 2vw, 15px)", padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 14px)" }}
            />
          </div>
          <div className="field">
            <label style={{ fontSize: "clamp(13px, 2vw, 14px)", fontWeight: 500 }}>Mot de passe</label>
            <input
              type="password"
              required
              value={form.motDePasse}
              onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
              placeholder="••••••••"
              style={{ fontSize: "clamp(14px, 2vw, 15px)", padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 14px)" }}
            />
          </div>

          <button className="btn btn-primary btn-block" disabled={loading} type="submit" style={{ minHeight: 44, fontSize: "clamp(14px, 2vw, 15px)" }}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <p style={{ textAlign: "center", marginTop: "clamp(16px, 3vw, 20px)", fontSize: "clamp(13px, 2vw, 14px)" }}>
            Pas encore de compte ?{" "}
            <Link to="/inscription" style={{ color: "var(--nk-sky-500)", fontWeight: 600 }}>
              Créer un compte
            </Link>
          </p>
          <p style={{ textAlign: "center", marginTop: "clamp(6px, 1.5vw, 8px)", fontSize: "clamp(12px, 2vw, 13px)" }}>
            <Link to="/accueil" style={{ color: "var(--nk-ink-soft)", display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
              Continuer comme visiteur <FiArrowRight size={14} />
            </Link>
          </p>
        </form>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .nk-auth-side { display: none !important; }
          .login-container {
            width: 100%;
          }
          .login-container > div:last-child {
            width: 100%;
            flex: 1;
          }
        }
        @media (max-width: 540px) {
          .login-container > div:last-child {
            padding: clamp(20px, 6vw, 28px) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
