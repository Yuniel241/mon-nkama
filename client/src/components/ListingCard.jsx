import { Link } from "react-router-dom";
import { FiCheckCircle, FiStar, FiLock } from "react-icons/fi";

const typeLabels = {
  chambre: "Chambre",
  studio: "Studio",
  appartement: "Appartement",
  maison: "Maison",
};

const packLabels = {
  standard: "Pack Standard",
  premium: "Pack Premium",
  golden: "Pack Golden"
};

const formatPrix = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

// Types autorisés par pack
const TYPES_AUTORISES = {
  standard: ["chambre"],
  premium: ["chambre", "studio", "maison"],
  golden: ["chambre", "studio", "appartement", "maison"]
};

const ListingCard = ({ logement, userSubscription = null, layout = "grid" }) => {
  const photosArr = Array.isArray(logement.photos)
    ? logement.photos
    : typeof logement.photos === "string"
    ? logement.photos.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const photo = photosArr[0];
  const isList = layout === "list";
  
  // Determine if user can access this listing
  let isAccessible = true;
  let lockReason = "";
  
  const isSubscriptionActive = userSubscription &&
    userSubscription.pack &&
    userSubscription.pack !== "aucun" &&
    userSubscription.dateExpiration &&
    new Date(userSubscription.dateExpiration) > new Date();

  // Case 1: Non-authenticated user
  if (userSubscription === null) {
    isAccessible = false;
    lockReason = "Connectez-vous pour voir les annonces";
  }
  // Case 2: Authenticated but no subscription or expired subscription
  else if (!isSubscriptionActive) {
    isAccessible = false;
    lockReason = "Choisissez un abonnement actif pour voir les annonces";
  }
  // Case 3: Authenticated with subscription but type not authorized
  else {
    const allowedTypes = TYPES_AUTORISES[userSubscription.pack] || [];
    if (!allowedTypes.includes(logement.type)) {
      isAccessible = false;
      lockReason = `Pack ${userSubscription.pack} - ${allowedTypes.join(", ")} uniquement`;
    }
  }

  return (
    <Link
      to={isAccessible ? `/logement/${logement._id}` : "#"}
      className="card"
      style={{
        display: isList ? "flex" : "block",
        overflow: "hidden",
        transition: "box-shadow 0.2s ease, transform 0.15s ease",
        opacity: isAccessible ? 1 : 0.6,
        pointerEvents: isAccessible ? "auto" : "none",
        position: "relative"
      }}
      onMouseEnter={(e) => {
        if (isAccessible) {
          e.currentTarget.style.boxShadow = "var(--nk-shadow-md)";
        }
      }}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--nk-shadow-sm)")}
    >
      <div
        style={{
          position: "relative",
          width: isList ? "clamp(160px, 30vw, 220px)" : "100%",
          flexShrink: 0,
          aspectRatio: "4/3",
          height: isList ? "clamp(120px, 22vw, 160px)" : undefined,
          background: "var(--nk-line)",
          filter: !isAccessible ? "blur(3px)" : "none"
        }}
      >
        {photo ? (
          <img src={photo} alt={logement.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--nk-ink-soft)" }}>
            Pas de photo
          </div>
        )}
        
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
          {logement.statut === "verifiee" && (
            <span className="badge badge-verified" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <FiCheckCircle size={14} /> Vérifiée
            </span>
          )}
          {logement.premium && (
            <span className="badge badge-premium" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <FiStar size={14} /> Premium
            </span>
          )}
          {logement.packProprietaire && (
            <span style={{ 
              background: "#f3f4f6", 
              color: "#374151", 
              padding: "4px 10px", 
              borderRadius: 4, 
              fontSize: 11, 
              fontWeight: 600 
            }}>
              {packLabels[logement.packProprietaire] || logement.packProprietaire}
            </span>
          )}
        </div>

        {!isAccessible && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 28
          }}>
            <FiLock size={32} />
          </div>
        )}
      </div>

      <div style={{ padding: 16, flex: 1, opacity: !isAccessible ? 0.7 : 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <h3 style={{ fontSize: 17, fontWeight: 600, fontFamily: "var(--font-body)", color: "var(--nk-navy-900)" }}>
            {logement.titre}
          </h3>
          <span
            style={{
              background: "var(--nk-navy-900)",
              color: "#fff",
              padding: "4px 10px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {typeLabels[logement.type]}
          </span>
        </div>
        <p style={{ fontSize: 13.5, marginTop: 4 }}>
          {logement.quartier}, {logement.ville}
        </p>
        <p style={{ fontSize: 13, marginTop: 6, color: "var(--nk-ink-soft)" }}>
          {logement.pieces} pièce{logement.pieces > 1 ? "s" : ""} · {logement.meuble ? "Meublé" : "Non meublé"}
        </p>
        
        {!isAccessible && (
          <div style={{
            background: "#fef3c7",
            border: "1px solid #fcd34d",
            borderRadius: 6,
            padding: "8px 10px",
            marginTop: 10,
            fontSize: 12,
            color: "#b45309",
            fontWeight: 500
          }}>
            🔒 {lockReason || "Accès restreint"}
          </div>
        )}
        
        {isAccessible && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--nk-green-600)" }}>
              {formatPrix(logement.prix)}
            </span>
            <span style={{ fontSize: 12, color: "var(--nk-ink-soft)" }}>/mois</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ListingCard;
