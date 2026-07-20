import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AiOutlineDashboard, AiOutlineHome, AiOutlineTeam, AiOutlineDollarCircle } from "react-icons/ai";
import { FiFlag, FiCalendar, FiMenu, FiX } from "react-icons/fi";

const links = [
  { to: "/admin", label: "Tableau de bord", icon: AiOutlineDashboard, end: true },
  { to: "/admin/logements", label: "Gestion des annonces", icon: AiOutlineHome },
  { to: "/admin/visites", label: "Gestion des visites", icon: FiCalendar },
  { to: "/admin/proprietaires", label: "Gestion des propriétaires", icon: AiOutlineTeam },
  { to: "/admin/utilisateurs", label: "Gestion des utilisateurs", icon: AiOutlineTeam },
  { to: "/admin/signalements", label: "Signalements", icon: FiFlag },
  { to: "/admin/finances", label: "Tableau financier", icon: AiOutlineDollarCircle },
];

const AdminNav = ({ onNavigate }) => (
  <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {links.map((l) => (
      <NavLink
        key={l.to}
        to={l.to}
        end={l.end}
        onClick={onNavigate}
        style={({ isActive }) => ({
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 14px",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          color: isActive ? "var(--nk-navy-950)" : "rgba(255,255,255,0.8)",
          background: isActive ? "var(--nk-gold-500)" : "transparent",
        })}
      >
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          <l.icon size={18} />
        </span>{" "}
        {l.label}
      </NavLink>
    ))}
  </nav>
);

const AdminLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="nk-admin-shell">
      <aside className="nk-admin-sidebar">
        <div style={{ padding: "0 10px 20px" }}>
          <span
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 1,
              textTransform: "uppercase",
              opacity: 0.6,
            }}
          >
            Administration
          </span>
        </div>
        <AdminNav />
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="nk-admin-mobile-bar">
          <button type="button" aria-label="Menu administration" onClick={() => setDrawerOpen(true)}>
            <FiMenu size={20} />
          </button>
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Administration MON NKAMA</span>
        </div>

        <main className="nk-admin-main">
          <Outlet />
        </main>
      </div>

      <div
        className={`nk-mobile-overlay ${drawerOpen ? "open" : ""}`}
        onClick={closeDrawer}
        aria-hidden={!drawerOpen}
      />

      <aside className={`nk-admin-sidebar nk-admin-drawer-panel ${drawerOpen ? "open" : ""}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase", opacity: 0.7 }}>
            Administration
          </span>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Fermer"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              width: 36,
              height: 36,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiX size={18} />
          </button>
        </div>
        <AdminNav onNavigate={closeDrawer} />
      </aside>
    </div>
  );
};

export default AdminLayout;
