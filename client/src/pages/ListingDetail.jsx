import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { FiCheckCircle, FiFlag, FiPhone, FiMessageCircle, FiLink2, FiCrosshair } from "react-icons/fi";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const equipements = [
  ["meuble", "Meublé", FiCheckCircle],
  ["internet", "Internet disponible", FiCheckCircle],
  ["parking", "Parking", FiCheckCircle],
  ["climatisation", "Climatisation", FiCheckCircle],
  ["cuisineEquipee", "Cuisine équipée", FiCheckCircle],
  ["animauxAutorises", "Animaux autorisés", FiCheckCircle],
  ["disponibleImmediatement", "Disponible immédiatement", FiCheckCircle],
];

const formatPrix = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
const formatDate = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const ListingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logement, setLogement] = useState(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isFavori, setIsFavori] = useState(false);
  const [rdvDate, setRdvDate] = useState("");
  const [rdvHeure, setRdvHeure] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [rdvError, setRdvError] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [motifSignalement, setMotifSignalement] = useState("");
  const [mapCenter, setMapCenter] = useState([0.4162, 9.4673]);
  const [mapZoom, setMapZoom] = useState(14);
  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => {
    api.get(`/listings/${id}`).then((res) => {
      const data = res.data;
      data.photos = Array.isArray(data.photos)
        ? data.photos
        : (typeof data.photos === 'string' ? data.photos.split(',').map(s => s.trim()).filter(Boolean) : []);
      // ensure photos is an array
      if (!data.photos || data.photos.length === 0) data.photos = [];
      setLogement(data);
      // ensure activePhoto index is valid
      setActivePhoto((prev) => (data.photos.length > 0 ? Math.min(prev, data.photos.length - 1) : 0));
    });
    if (user) {
      api.get("/favorites").then((res) => {
        setIsFavori(res.data.some((f) => f.logement._id === id));
      });
    }
  }, [id, user]);

  useEffect(() => {
    if (logement?.latitude && logement?.longitude) {
      setMapCenter([logement.latitude, logement.longitude]);
      setMapZoom(14);
    }
  }, [logement]);

  const locateCurrentPosition = () => {
    if (!navigator.geolocation) {
      return alert("La géolocalisation n'est pas disponible sur votre appareil.");
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setUserPosition(coords);
        setMapCenter(coords);
        setMapZoom(13);
      },
      () => {
        alert("Impossible de récupérer votre position. Autorisez la géolocalisation.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const toggleFavori = async () => {
    if (!user) return navigate("/connexion");
    if (isFavori) {
      await api.delete(`/favorites/${id}`);
    } else {
      await api.post(`/favorites/${id}`);
    }
    setIsFavori(!isFavori);
  };

  // Check if user has active locataire subscription
  const hasActiveLocataireSubscription = user && 
    user.abonnementLocataire && 
    user.abonnementLocataire !== "aucun" &&
    new Date(user.dateFinAbonnementLocataire) > new Date();

  const contacter = async () => {
    if (!user) return navigate("/connexion");
    if (!hasActiveLocataireSubscription) {
      alert("Pour voir les coordonnées du bailleur, choisissez un abonnement dans la page Paiements.");
      return;
    }
    const res = await api.post("/messages/start", {
      destinataireId: logement.proprietaire._id,
      logementId: id,
    });
    navigate(`/messages/${res.data._id}`);
  };

  const isOwner = Boolean(
    user &&
      logement?.proprietaire &&
      String(logement.proprietaire._id ?? logement.proprietaire) === String(user._id)
  );
  const hasVisitPass = hasActiveLocataireSubscription;

  const reserverVisite = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/connexion");
    if (isOwner) {
      setRdvError("Vous ne pouvez pas réserver une visite sur votre propre logement.");
      return;
    }
    if (!hasVisitPass) {
      setRdvError("Pour réserver une visite, choisissez un pass visite sur la page Paiements.");
      return;
    }

    try {
      const res = await api.post("/appointments", { logement: id, date: rdvDate, heure: rdvHeure });
      setConfirmation(res.data);
      setRdvError("");
    } catch (err) {
      setConfirmation(null);
      setRdvError(err.response?.data?.message || err.message || "Impossible d’envoyer la demande de visite.");
    }
  };

  const signaler = async () => {
    if (!user) return navigate("/connexion");
    await api.post("/reports", { logement: id, utilisateurSignale: logement.proprietaire._id, motif: motifSignalement });
    setShowReport(false);
    setMotifSignalement("");
    alert("Signalement envoyé. Merci de nous aider à sécuriser la plateforme.");
  };

  if (!logement) return <div className="container" style={{ padding: 80, textAlign: "center" }}>Chargement...</div>;

  const joursDepuisPublication = Math.floor((Date.now() - new Date(logement.createdAt)) / 86400000);

  return (
    <div style={{ background: "var(--nk-cream)", paddingBottom: 60 }}>
      <div className="container" style={{ paddingTop: 24 }}>
        {/* Galerie */}
        <div style={{ display: "grid", gridTemplateColumns: "clamp(1fr, 70%, 2fr) clamp(60px, 30%, 1fr)", gap: 8, borderRadius: 18, overflow: "hidden", height: "clamp(280px, 50vw, 420px)" }} className="nk-gallery">
          <div style={{ position: "relative", width: "100%", background: "var(--nk-line)", borderRadius: 12, overflow: "hidden" }}>
            {/* Use 4:3 ratio to match list thumbnails and keep same crop */}
            <div style={{ width: "100%", paddingBottom: "75%", position: "relative" }}>
              <img
                src={logement.photos[activePhoto]}
                alt={logement.titre}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center", display: "block" }}
              />
            </div>
            {/* Navigation flèches */}
            {logement.photos.length > 1 && (
              <>
                <button
                  onClick={() => setActivePhoto((s) => (s - 1 + logement.photos.length) % logement.photos.length)}
                  aria-label="Précédent"
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(0,0,0,0.45)",
                    color: "#fff",
                    border: "none",
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  ◀
                </button>
                <button
                  onClick={() => setActivePhoto((s) => (s + 1) % logement.photos.length)}
                  aria-label="Suivant"
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(0,0,0,0.45)",
                    color: "#fff",
                    border: "none",
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  ▶
                </button>
              </>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "100%", overflowY: "auto" }} className="nk-thumbs-vertical">
            {logement.photos.map((p, i) => (
              <div
                key={i}
                onClick={() => setActivePhoto(i)}
                style={{
                  width: "100%",
                  height: 0,
                  paddingBottom: "75%", // 4:3 ratio to match listing thumbnails
                  position: "relative",
                  cursor: "pointer",
                  borderRadius: 8,
                  overflow: "hidden",
                  boxShadow: activePhoto === i ? "0 0 0 3px rgba(59,130,246,0.2)" : "none",
                }}
              >
                <img
                  src={p}
                  alt={`${logement.titre} - ${i + 1}`}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center" }}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "clamp(1fr, 66%, 2fr) clamp(280px, 34%, 1fr)", gap: "clamp(20px, 4vw, 32px)", marginTop: "clamp(20px, 4vw, 32px)" }} className="nk-detail-grid">
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {logement.statut === "verifiee" && (
                <span className="badge badge-verified" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <FiCheckCircle size={14} /> Annonce vérifiée
                </span>
              )}
              {logement.premium && (
                <span className="badge badge-premium" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <FiFlag size={14} /> Premium
                </span>
              )}
              {joursDepuisPublication < 7 && <span className="badge badge-new">Récente</span>}
            </div>
            <h1 style={{ fontSize: 30 }}>{logement.titre}</h1>
            <p style={{ marginTop: 6 }}>
              {logement.adresse ? logement.adresse + ", " : ""}
              {logement.quartier}, {logement.ville}
            </p>
            <p style={{ fontSize: 26, fontWeight: 700, color: "var(--nk-green-600)", marginTop: 14 }}>
              {formatPrix(logement.prix)} <span style={{ fontSize: 14, color: "var(--nk-ink-soft)", fontWeight: 400 }}>/mois</span>
            </p>

            <div className="card" style={{ padding: 20, marginTop: 24, display: "flex", gap: 24, flexWrap: "wrap" }}>
              <Stat label="Pièces" value={logement.pieces} />
              <Stat label="Salles de bain" value={logement.sallesDeBain} />
              <Stat label="Type" value={logement.type} />
              <Stat label="Publiée le" value={formatDate(logement.createdAt)} />
            </div>

            <h3 style={{ marginTop: 28, fontSize: 19 }}>Description</h3>
            <p style={{ marginTop: 8 }}>{logement.description}</p>

            <h3 style={{ marginTop: 28, fontSize: 19 }}>Équipements</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(clamp(150px, 40vw, 200px), 1fr))", gap: "clamp(8px, 2vw, 12px)", marginTop: 12 }}>
              {equipements.filter(([k]) => logement[k]).map(([k, label, Icon]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                  <Icon size={16} /> {label}
                </div>
              ))}
            </div>

            {logement.latitude && hasActiveLocataireSubscription && (
              <>
                <h3 style={{ marginTop: 28, fontSize: 19 }}>Localisation</h3>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={locateCurrentPosition}
                    className="btn btn-sm"
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--nk-gold-500)", color: "var(--nk-navy-950)", border: "none" }}
                  >
                    <FiCrosshair size={16} /> Ma position
                  </button>
                </div>
                <div style={{ height: 280, borderRadius: 14, overflow: "hidden", marginTop: 12, border: "1px solid var(--nk-line)" }}>
                  <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapController center={mapCenter} zoom={mapZoom} />
                    {userPosition && (
                      <Marker position={userPosition}>
                        <Popup>Votre position</Popup>
                      </Marker>
                    )}
                    <Marker position={[logement.latitude, logement.longitude]} />
                  </MapContainer>
                </div>
              </>
            )}
            {logement.latitude && !hasActiveLocataireSubscription && (
              <div className="card" style={{ padding: 16, marginTop: 28, background: "var(--nk-warning-light)", border: "1px solid var(--nk-warning)" }}>
                <p style={{ fontSize: 14, color: "var(--nk-warning-dark)", margin: 0 }}>
                  {user ? "La localisation est réservée aux abonnés. " : "Connectez-vous pour voir la localisation. "}
                  {!user && <Link to="/connexion" style={{ color: "var(--nk-navy-900)", fontWeight: 600 }}>Se connecter</Link>}
                  {user && !hasActiveLocataireSubscription && <Link to="/paiements" style={{ color: "var(--nk-navy-900)", fontWeight: 600 }}>Choisir un abonnement</Link>}
                </p>
              </div>
            )}

            <button
              onClick={() => setShowReport(true)}
              style={{ marginTop: 24, background: "none", border: "none", color: "var(--nk-danger)", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <FiFlag size={16} /> Signaler cette annonce
            </button>
            {showReport && (
              <div className="card" style={{ padding: 16, marginTop: 12 }}>
                <textarea
                  placeholder="Motif du signalement..."
                  value={motifSignalement}
                  onChange={(e) => setMotifSignalement(e.target.value)}
                  style={{ width: "100%", minHeight: 70, padding: 10, borderRadius: 8, border: "1px solid var(--nk-line)" }}
                />
                <button onClick={signaler} className="btn btn-danger btn-sm" style={{ marginTop: 8 }}>
                  Envoyer le signalement
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--nk-navy-900)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                  {logement.proprietaire?.prenom?.[0]}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: "var(--nk-navy-900)" }}>
                    {logement.proprietaire?.prenom} {logement.proprietaire?.nom}
                  </p>
                  <p style={{ fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {logement.proprietaire?.verifie ? <><FiCheckCircle size={14} /> Identité vérifiée</> : "Identité non vérifiée"}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
                {hasActiveLocataireSubscription ? (
                  <>
                    <a href={`tel:${logement.proprietaire?.telephone}`} className="btn btn-outline btn-block" style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                      <FiPhone size={16} /> {logement.proprietaire?.telephone}
                    </a>
                    <a
                      href={`https://wa.me/${logement.proprietaire?.telephone?.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-block"
                      style={{ background: "#25D366", color: "#fff", display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}
                    >
                      WhatsApp
                    </a>
                  </>
                ) : (
                  <div className="card" style={{ padding: 12, fontSize: 13, color: "var(--nk-ink-soft)", textAlign: "center" }}>
                    {user ? "Les coordonnées du bailleur sont réservées aux abonnés." : "Connectez-vous pour voir les coordonnées du bailleur."}
                  </div>
                )}
                <button onClick={contacter} className="btn btn-primary btn-block" style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  <FiMessageCircle size={16} /> {hasActiveLocataireSubscription ? "Contacter" : "Déverrouiller le contact"}
                </button>
                <button onClick={toggleFavori} className="btn btn-outline btn-block" style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  {isFavori ? <><AiFillHeart size={16} color="#dc3545" /> Retirer des favoris</> : <><AiOutlineHeart size={16} /> Ajouter aux favoris</>}
                </button>
                <button
                  onClick={() => navigator.share ? navigator.share({ title: logement.titre, url: window.location.href }) : navigator.clipboard.writeText(window.location.href)}
                  className="btn btn-outline btn-block"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}
                >
                  <FiLink2 size={16} /> Partager
                </button>
              </div>
            </div>

            <div className="card" style={{ padding: 20, marginTop: 18 }}>
              <h3 style={{ fontSize: 17 }}>Réserver une visite</h3>
              {confirmation ? (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <p style={{ fontWeight: 700, color: "var(--nk-green-600)", marginBottom: 8 }}>
                    {confirmation.statut === "confirmee" ? "Visite confirmée !" : "Demande de visite envoyée !"}
                  </p>
                  <p style={{ fontSize: 13, marginTop: 0 }}>
                    {confirmation.statut === "confirmee"
                      ? "Le propriétaire a confirmé votre visite."
                      : "Votre demande est en attente de confirmation du propriétaire."}
                  </p>
                  <p style={{ fontSize: 13, marginTop: 10 }}>Code QR de réservation :</p>
                  <p style={{ fontFamily: "monospace", fontSize: 18, marginTop: 6, letterSpacing: 2 }}>{confirmation.qrCode}</p>
                </div>
              ) : (
                <>
                  {user ? (
                    isOwner ? (
                      <div className="card" style={{ padding: 14, fontSize: 13, color: "var(--nk-danger)", textAlign: "center" }}>
                        Vous êtes le propriétaire de cette annonce, vous ne pouvez pas réserver une visite sur votre propre logement.
                      </div>
                    ) : hasVisitPass ? (
                      <form onSubmit={reserverVisite} style={{ marginTop: 12 }}>
                        <div className="field">
                          <label>Date</label>
                          <input type="date" required value={rdvDate} onChange={(e) => setRdvDate(e.target.value)} />
                        </div>
                        <div className="field">
                          <label>Heure</label>
                          <input type="time" required value={rdvHeure} onChange={(e) => setRdvHeure(e.target.value)} />
                        </div>
                        {rdvError && <p style={{ color: "var(--nk-danger)", marginBottom: 12 }}>{rdvError}</p>}
                        <button type="submit" className="btn btn-gold btn-block">Demander la visite</button>
                      </form>
                    ) : (
                      <div className="card" style={{ padding: 14, fontSize: 13, color: "var(--nk-ink-soft)", textAlign: "center" }}>
                        Pour réserver une visite, vous devez souscrire un pass visite sur la page Paiements.
                      </div>
                    )
                  ) : (
                    <div className="card" style={{ padding: 14, fontSize: 13, color: "var(--nk-ink-soft)", textAlign: "center" }}>
                      Connectez-vous pour demander une visite.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .nk-detail-grid { grid-template-columns: 1fr !important; }
          .nk-gallery { height: 280px !important; grid-template-columns: 1fr !important; }
          .nk-thumbs-vertical { flex-direction: row !important; max-height: none !important; overflow-x: auto !important; gap: 8px !important; }
          .nk-thumbs-vertical > div { flex: 0 0 auto !important; width: 140px !important; height: 90px !important; padding-bottom: 0 !important; }
        }
      `}</style>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div>
    <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
    <p style={{ fontWeight: 700, color: "var(--nk-navy-900)", marginTop: 2, textTransform: "capitalize" }}>{value}</p>
  </div>
);

export default ListingDetail;
