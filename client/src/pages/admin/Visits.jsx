import { useState, useEffect } from "react";
import api from "../../api/axios.js";
import { FiClock, FiCheckCircle, FiX, FiArrowRight } from "react-icons/fi";

const Visits = () => {
  const [visites, setVisites] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState("");
  const [loading, setLoading] = useState(true);

  const loadVisites = async () => {
    try {
      const url = filtreStatut ? `/admin/visites?statut=${filtreStatut}` : "/admin/visites";
      const response = await api.get(url);
      setVisites(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement des visites:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadVisites();
  }, [filtreStatut]);

  const mettreAJourStatut = async (id, nouveauStatut) => {
    try {
      const response = await api.put(`/admin/visites/${id}`, { statut: nouveauStatut });
      setVisites(visites.map((v) => (v._id === id ? response.data : v)));
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
    }
  };

  const getStatusInfo = (statut) => {
    const statusMap = {
      en_attente: {
        label: "En attente",
        icon: FiClock,
        color: "#f59e0b",
        bg: "#fef3c7",
      },
      confirmee: {
        label: "Confirmée",
        icon: FiCheckCircle,
        color: "#10b981",
        bg: "#d1fae5",
      },
      annulee: {
        label: "Annulée",
        icon: FiX,
        color: "#ef4444",
        bg: "#fee2e2",
      },
      terminee: {
        label: "Terminée",
        icon: FiCheckCircle,
        color: "#3b82f6",
        bg: "#dbeafe",
      },
    };
    return statusMap[statut] || statusMap.en_attente;
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Chargement des visites...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>Gestion des visites</h1>
      <p style={{ marginBottom: 28, color: "var(--nk-ink-soft)" }}>
        Suivez et gérez toutes les visites programmées sur la plateforme.
      </p>

      {/* Filtres */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => setFiltreStatut("")}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: `2px solid ${filtreStatut === "" ? "var(--nk-navy-900)" : "var(--nk-line)"}`,
            background: filtreStatut === "" ? "var(--nk-navy-900)" : "#fff",
            color: filtreStatut === "" ? "#fff" : "var(--nk-ink)",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Toutes
        </button>
        {["en_attente", "confirmee", "annulee", "terminee"].map((statut) => {
          const info = getStatusInfo(statut);
          return (
            <button
              key={statut}
              onClick={() => setFiltreStatut(statut)}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: `2px solid ${filtreStatut === statut ? info.color : "var(--nk-line)"}`,
                background: filtreStatut === statut ? info.bg : "#fff",
                color: filtreStatut === statut ? info.color : "var(--nk-ink)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {info.label}
            </button>
          );
        })}
      </div>

      {/* Tableau des visites */}
      {visites.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ fontSize: 16, color: "var(--nk-ink-soft)" }}>
            Aucune visite trouvée.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {visites.map((visite) => {
            const statusInfo = getStatusInfo(visite.statut);
            const StatusIcon = statusInfo.icon;
            const visitDate = new Date(visite.date);
            const now = new Date();
            const isUpcoming = visitDate > now;

            return (
              <div
                key={visite._id}
                className="card"
                style={{
                  padding: 16,
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto auto auto",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                {/* Statut */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    background: statusInfo.bg,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <StatusIcon size={18} color={statusInfo.color} />
                </div>

                {/* Détails */}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                    {visite.logement?.titre || "Logement"}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--nk-ink-soft)" }}>
                    <span style={{ fontWeight: 600 }}>
                      {visite.utilisateur?.nom} {visite.utilisateur?.prenom}
                    </span>{" "}
                    • {visite.utilisateur?.telephone}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--nk-ink-soft)", marginTop: 2 }}>
                    {visitDate.toLocaleDateString("fr-FR")} à {visite.heure}
                  </p>
                </div>

                {/* Prix */}
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--nk-navy-900)" }}>
                    {new Intl.NumberFormat("fr-FR").format(visite.logement?.prix || 0)} FCFA
                  </p>
                </div>

                {/* Statut */}
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: statusInfo.color,
                      textTransform: "capitalize",
                    }}
                  >
                    {statusInfo.label}
                  </p>
                </div>

                {/* Actions */}
                {isUpcoming && visite.statut === "en_attente" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => mettreAJourStatut(visite._id, "confirmee")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "none",
                        background: "#10b981",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => mettreAJourStatut(visite._id, "annulee")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "none",
                        background: "#ef4444",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                )}

                {!isUpcoming && visite.statut === "confirmee" && (
                  <button
                    onClick={() => mettreAJourStatut(visite._id, "terminee")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "none",
                      background: "#3b82f6",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Marquer comme terminée
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Résumé */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))",
          gap: 12,
          marginTop: 24,
        }}
      >
        {["en_attente", "confirmee", "annulee", "terminee"].map((statut) => {
          const count = visites.filter((v) => v.statut === statut).length;
          const info = getStatusInfo(statut);

          return (
            <div
              key={statut}
              className="card"
              style={{
                padding: 16,
                borderLeft: `4px solid ${info.color}`,
              }}
            >
              <p style={{ fontSize: 12, color: "var(--nk-ink-soft)", fontWeight: 600 }}>
                {info.label}
              </p>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: info.color,
                  marginTop: 8,
                }}
              >
                {count}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Visits;
