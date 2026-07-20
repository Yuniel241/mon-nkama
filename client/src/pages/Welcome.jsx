import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { FiArrowRight, FiShield, FiMessageCircle, FiCalendar, FiHeadphones } from "react-icons/fi";

const Welcome = () => {
  const features = [
    { 
      icon: <FiShield size={20} />, 
      title: "Annonces vérifiées", 
      description: "Des logements approuvés et sécurisés." 
    },
    { 
      icon: <FiMessageCircle size={20} />, 
      title: "Messagerie directe", 
      description: "Contactez les propriétaires en toute simplicité." 
    },
    { 
      icon: <FiCalendar size={20} />, 
      title: "Rendez-vous faciles", 
      description: "Réservez, confirmez et suivez vos visites." 
    },
    { 
      icon: <FiHeadphones size={20} />, 
      title: "Support gabonais", 
      description: "Une assistance locale pour vos projets." 
    },
  ];

  return (
    <div style={styles.container}>
      {/* Formes décoratives subtiles */}
      <div style={styles.decorShape1} />
      <div style={styles.decorShape2} />

      {/* Contenu principal */}
      <div className="welcome-content" style={styles.content}>
        {/* Section gauche - Texte */}
        <div style={styles.leftSection}>
          <div style={styles.logoRow}>
            <Logo size={100} showText={false} />
            <div>
              <div style={styles.brandName}>MON NKAMA</div>
            </div>
          </div>
          <h1 className="welcome-title" style={styles.title}>
            Trouvez votre logement idéal{" "}
            <span style={styles.highlight}>sans stress</span>
          </h1>
          
          <p style={styles.subtitle}>
            Chambres, studios et appartements — des annonces vérifiées,
            en toute sécurité. Le lien de confiance entre propriétaires et locataires.
          </p>

          {/* Boutons d'action */}
          <div className="button-group" style={styles.buttonGroup}>
            <Link to="/connexion" style={styles.primaryButton}>
              <span>Se connecter</span>
              <FiArrowRight size={18} style={{ marginLeft: 8 }} />
            </Link>
            <Link to="/inscription" style={styles.secondaryButton}>
              Créer un compte
            </Link>
          </div>

          <Link to="/accueil" style={styles.visitorLink}>
            <span>Continuer comme visiteur</span>
            <FiArrowRight size={16} />
          </Link>

          {/* Cartes de fonctionnalités */}
          <div className="features-grid" style={styles.featuresGrid}>
            {features.map((item, index) => (
              <div key={index} style={styles.featureCard}>
                <div style={styles.featureIcon}>{item.icon}</div>
                <div>
                  <h4 style={styles.featureTitle}>{item.title}</h4>
                  <p style={styles.featureDescription}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section droite - Image */}
        <div style={styles.rightSection}>
          <div style={styles.imageWrapper}>
            <div style={styles.imageContainer}>
              <img
                src="/maison_famille.jpeg"
                alt="Maison familiale"
                style={styles.image}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Media Queries */}
      <style>{`
        @media (max-width: 1024px) {
          .welcome-content {
            grid-template-columns: 1fr !important;
            gap: clamp(28px, 6vw, 48px) !important;
          }
        }
        
        @media (max-width: 768px) {
          .welcome-content {
            padding: clamp(20px, 4vw, 32px) clamp(16px, 5vw, 20px) !important;
          }
          
          .features-grid {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
          }

          .welcome-title {
            font-size: clamp(24px, 5vw, 36px) !important;
          }
        }

        @media (max-width: 540px) {
          .button-group {
            flex-direction: column !important;
            width: 100% !important;
          }

          .button-group a {
            width: 100% !important;
            flex: 1 1 auto !important;
          }
          
          .welcome-title {
            font-size: clamp(22px, 4.5vw, 32px) !important;
          }

          .features-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "#eef6ff",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  
  // Formes décoratives subtiles
  decorShape1: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 75%)",
    zIndex: 0,
  },
  
  decorShape2: {
    position: "absolute",
    bottom: -80,
    left: -80,
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(15,23,42,0.05) 0%, transparent 75%)",
    zIndex: 0,
  },

  // Header
  header: {
    padding: "28px 40px 20px",
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    background: "#f8fbff",
    borderBottom: "1px solid rgba(59,130,246,0.16)",
    boxShadow: "0 1px 3px rgba(59,130,246,0.08)",
  },

  logoWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    background: "linear-gradient(135deg, rgba(37,99,235,0.16) 0%, rgba(37,99,235,0.08) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },

  brandName: {
    color: "#0f172a",
    fontWeight: 800,
    fontSize: 18,
    letterSpacing: "0.08em",
  },

  // Badge
  badge: {
    display: "inline-block",
    padding: "8px 18px",
    borderRadius: 50,
    background: "rgba(59,130,246,0.14)",
    color: "#1d4ed8",
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 24,
    border: "1px solid rgba(59,130,246,0.22)",
  },

  // Contenu principal
  content: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    alignItems: "center",
    gap: "clamp(20px, 3vw, 32px)",
    position: "relative",
    zIndex: 1,
    padding: "clamp(16px, 4vw, 28px) clamp(16px, 5vw, 24px)",
    maxWidth: 1080,
    margin: "0 auto",
    width: "100%",
  },

  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },

  tagline: {
    color: "#475569",
    fontSize: 13,
    fontWeight: 500,
    marginTop: 2,
  },

  // Section gauche
  leftSection: {
    textAlign: "left",
    maxWidth: 520,
  },

  title: {
    color: "#0f172a",
    fontSize: "clamp(28px, 5vw, 48px)",
    lineHeight: 1.1,
    margin: "0 0 clamp(10px, 2vw, 16px)",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    wordBreak: "break-word",
  },

  highlight: {
    color: "#2563eb",
    position: "relative",
    display: "inline-block",
  },

  subtitle: {
    color: "#475569",
    fontSize: "clamp(14px, 2.5vw, 16px)",
    lineHeight: 1.7,
    marginBottom: "clamp(16px, 3vw, 24px)",
    maxWidth: "100%",
    fontWeight: 400,
  },

  // Boutons
  buttonGroup: {
    display: "flex",
    gap: "clamp(8px, 2vw, 12px)",
    marginBottom: "clamp(8px, 2vw, 16px)",
    flexWrap: "wrap",
    width: "100%",
  },

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "clamp(12px, 2.5vw, 15px) clamp(20px, 4vw, 30px)",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "clamp(14px, 2vw, 16px)",
    borderRadius: 14,
    textDecoration: "none",
    transition: "all 0.2s ease",
    boxShadow: "0 12px 24px rgba(37,99,235,0.18)",
    minWidth: "clamp(140px, 40%, 180px)",
    flex: "1 1 auto",
    border: "none",
    cursor: "pointer",
    minHeight: 44,
  },

  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "clamp(12px, 2.5vw, 15px) clamp(20px, 4vw, 30px)",
    background: "#ffffff",
    color: "#1d4ed8",
    fontWeight: 600,
    fontSize: "clamp(14px, 2vw, 16px)",
    borderRadius: 14,
    textDecoration: "none",
    transition: "all 0.2s ease",
    border: "2px solid rgba(37,99,235,0.24)",
    minWidth: "clamp(140px, 40%, 180px)",
    flex: "1 1 auto",
    minHeight: 44,
  },

  visitorLink: {
    color: "#1d4ed8",
    fontSize: 14,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
    marginBottom: 24,
    transition: "color 0.2s ease",
    padding: "4px 0",
  },

  // Grille de fonctionnalités
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(clamp(140px, 45vw, 200px), 1fr))",
    gap: "clamp(8px, 2vw, 12px)",
    marginTop: "clamp(16px, 4vw, 28px)",
  },

  featureCard: {
    padding: "14px 12px",
    borderRadius: 16,
    background: "#ffffff",
    border: "1px solid rgba(59,130,246,0.16)",
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    transition: "all 0.2s ease",
    boxShadow: "0 2px 10px rgba(59,130,246,0.05)",
  },

  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "rgba(59,130,246,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2563eb",
    flexShrink: 0,
  },

  featureTitle: {
    margin: "0 0 4px",
    fontSize: 15,
    color: "#0f172a",
    fontWeight: 700,
  },

  featureDescription: {
    margin: 0,
    color: "#64748b",
    fontSize: 13,
    lineHeight: 1.6,
  },

  // Section droite
  rightSection: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 8,
  },

  imageWrapper: {
    position: "relative",
    width: "100%",
    maxWidth: 460,
  },

  imageContainer: {
    width: "100%",
    aspectRatio: "1 / 1.04",
    overflow: "hidden",
    borderRadius: 24,
    background: "#ffffff",
    border: "1px solid rgba(59,130,246,0.16)",
    boxShadow: "0 10px 26px rgba(59,130,246,0.08)",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  infoCard: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    padding: 14,
    borderRadius: 18,
    background: "#ffffff",
    border: "1px solid rgba(59,130,246,0.16)",
    boxShadow: "0 8px 24px rgba(59,130,246,0.08)",
  },

  infoText: {
    margin: 0,
    color: "#1e3a8a",
    fontSize: 14,
    lineHeight: 1.65,
    textAlign: "center",
    fontWeight: 500,
  },
};

export default Welcome;