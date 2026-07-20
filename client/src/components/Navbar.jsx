import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import Logo from "./Logo.jsx";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [nbNotifs, setNbNotifs] = useState(0);

  const isBailleur = user?.role === "proprietaire";

  useEffect(() => {
    setMobileNavOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!user) return;
    api
      .get("/notifications")
      .then((res) => setNbNotifs(res.data.filter((n) => !n.lu).length))
      .catch(() => {});
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileNavOpen(false);
    setMenuOpen(false);
  };

  const navLinks = (
    <>
      <Link to="/accueil" onClick={() => setMobileNavOpen(false)}>
        Rechercher
      </Link>
      <Link to="/carte" onClick={() => setMobileNavOpen(false)}>
        Carte
      </Link>
      {isBailleur && (
        <Link to="/mes-annonces" onClick={() => setMobileNavOpen(false)}>
          Mes annonces
        </Link>
      )}
      {user?.role === "admin" && (
        <Link to="/admin" onClick={() => setMobileNavOpen(false)}>
          Administration
        </Link>
      )}
    </>
  );

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#fff",
        borderBottom: "1px solid var(--nk-line)",
      }}
    >
      <div className="container nk-navbar-inner">
        <Link to={user ? "/accueil" : "/"}>
          <Logo size={40} />
        </Link>

        <nav className="nk-nav-links">{navLinks}</nav>

        <div className="nk-nav-actions">
          {user ? (
            <>
              <Link to="/notifications" style={{ position: "relative", padding: 6 }} title="Notifications">
                <BellIcon />
                {nbNotifs > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      background: "var(--nk-danger)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: "50%",
                      width: 16,
                      height: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {nbNotifs}
                  </span>
                )}
              </Link>
              <Link to="/favoris" title="Favoris" style={{ padding: 6 }}>
                <HeartIcon />
              </Link>
              <Link to="/messages" title="Messagerie" style={{ padding: 6 }}>
                <ChatIcon />
              </Link>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Menu utilisateur"
                  style={{
                    background: "var(--nk-navy-900)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 38,
                    height: 38,
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {user.prenom?.[0]?.toUpperCase()}
                </button>
                {menuOpen && (
                  <div
                    className="card"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 46,
                      width: 200,
                      padding: 8,
                      display: "flex",
                      flexDirection: "column",
                    }}
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <MenuLink to="/parametres" text="Paramètres" onClick={() => setMenuOpen(false)} />
                    {isBailleur && (
                      <MenuLink to="/publier" text="Publier une annonce" onClick={() => setMenuOpen(false)} />
                    )}
                    <MenuLink to="/rendez-vous" text="Mes rendez-vous" onClick={() => setMenuOpen(false)} />
                    <MenuLink to="/paiements" text="Paiements" onClick={() => setMenuOpen(false)} />
                    <button
                      onClick={handleLogout}
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        border: "none",
                        background: "transparent",
                        borderRadius: 8,
                        color: "var(--nk-danger)",
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="nk-nav-auth-btns" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Link to="/connexion" className="btn btn-outline btn-sm">
                Se connecter
              </Link>
              <Link to="/inscription" className="btn btn-primary btn-sm">
                Créer un compte
              </Link>
            </div>
          )}

          <button
            type="button"
            className="nk-hamburger"
            aria-label={mobileNavOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            {mobileNavOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      <div
        className={`nk-mobile-overlay ${mobileNavOpen ? "open" : ""}`}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden={!mobileNavOpen}
      />

      <div className={`nk-mobile-drawer ${mobileNavOpen ? "open" : ""}`} role="dialog" aria-modal="true">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo size={36} />
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Fermer"
            style={{ background: "none", border: "none", padding: 8, color: "var(--nk-navy-900)" }}
          >
            <FiX size={22} />
          </button>
        </div>

        <nav>
          {navLinks}
          {user ? (
            <>
              <Link to="/notifications" onClick={() => setMobileNavOpen(false)}>
                Notifications {nbNotifs > 0 ? `(${nbNotifs})` : ""}
              </Link>
              <Link to="/favoris" onClick={() => setMobileNavOpen(false)}>
                Favoris
              </Link>
              <Link to="/messages" onClick={() => setMobileNavOpen(false)}>
                Messagerie
              </Link>
              <Link to="/parametres" onClick={() => setMobileNavOpen(false)}>
                Paramètres
              </Link>
              {isBailleur && (
                <Link to="/publier" onClick={() => setMobileNavOpen(false)}>
                  Publier une annonce
                </Link>
              )}
              <Link to="/rendez-vous" onClick={() => setMobileNavOpen(false)}>
                Mes rendez-vous
              </Link>
              <Link to="/paiements" onClick={() => setMobileNavOpen(false)}>
                Paiements
              </Link>
              <button type="button" onClick={handleLogout} style={{ color: "var(--nk-danger)" }}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/connexion" onClick={() => setMobileNavOpen(false)}>
                Se connecter
              </Link>
              <Link to="/inscription" onClick={() => setMobileNavOpen(false)}>
                Créer un compte
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

const MenuLink = ({ to, text, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    style={{ padding: "10px 12px", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "var(--nk-navy-900)" }}
  >
    {text}
  </Link>
);

const BellIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="var(--nk-navy-900)" strokeWidth="2">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const HeartIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="var(--nk-navy-900)" strokeWidth="2">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);
const ChatIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="var(--nk-navy-900)" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default Navbar;
