import { useState, useEffect } from "react";
import api from "../../api/axios.js";
import { FiCalendar, FiCheckCircle, FiClock, FiX } from "react-icons/fi";

const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="card" style={{ padding: 20 }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div>
        <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, color: "var(--nk-ink-soft)" }}>
          {label}
        </p>
        <p style={{ fontSize: 30, fontWeight: 700, color: color || "var(--nk-navy-900)", marginTop: 8, fontFamily: "var(--font-display)" }}>
          {value}
        </p>
      </div>
      {Icon && <Icon size={24} color={color || "var(--nk-ink-soft)"} opacity={0.5} />}
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then((res) => setData(res.data));
  }, []);

  if (!data)
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Chargement du tableau de bord...</p>
      </div>
    );

  const maxType = Math.max(1, ...data.logementsParType.map((t) => t.count));
  const maxVisites = Math.max(1, ...data.visitesParStatut.map((v) => v.count));

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>Tableau de bord</h1>
      <p style={{ marginBottom: 28, color: "var(--nk-ink-soft)" }}>
        Vue d'ensemble de la plateforme MON NKAMA
      </p>

      {/* Cartes principales */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <StatCard
          label="Utilisateurs"
          value={data.nbUtilisateurs}
          color="var(--nk-navy-900)"
        />
        <StatCard label="Logements" value={data.nbLogements} color="#3b82f6" />
        <StatCard
          label="Propriétaires"
          value={data.nbProprietaires}
          color="#8b5cf6"
        />
        <StatCard
          label="En attente"
          value={data.logementsEnAttente}
          color="var(--nk-gold-500)"
        />
        <StatCard
          label="Visites"
          value={data.nbVisites}
          color="#10b981"
          icon={FiCalendar}
        />
        <StatCard
          label="Signalements"
          value={data.nbSignalements}
          color="var(--nk-danger)"
        />
      </div>

      {/* Grille de contenu */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px,1fr))",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* Répartition des logements */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>
            Répartition des logements par type
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {data.logementsParType.length === 0 ? (
              <p style={{ color: "var(--nk-ink-soft)" }}>Aucun logement enregistré.</p>
            ) : (
              data.logementsParType.map((t) => (
                <div key={t._id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>
                      {t._id}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--nk-navy-900)" }}>
                      {t.count}
                    </span>
                  </div>
                  <div
                    style={{
                      background: "var(--nk-line)",
                      borderRadius: 6,
                      height: 8,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${(t.count / maxType) * 100}%`,
                        background: "linear-gradient(90deg, #667eea, #764ba2)",
                        height: "100%",
                        borderRadius: 6,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Statistiques des visites */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>
            Situation des visites
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {data.visitesParStatut.length === 0 ? (
              <p style={{ color: "var(--nk-ink-soft)" }}>Aucune visite enregistrée.</p>
            ) : (
              data.visitesParStatut.map((v) => {
                const colors = {
                  en_attente: { bg: "#fef3c7", text: "#f59e0b", label: "En attente", icon: FiClock },
                  confirmee: { bg: "#d1fae5", text: "#10b981", label: "Confirmée", icon: FiCheckCircle },
                  annulee: { bg: "#fee2e2", text: "#ef4444", label: "Annulée", icon: FiX },
                  terminee: { bg: "#dbeafe", text: "#3b82f6", label: "Terminée", icon: FiCheckCircle },
                };
                const color = colors[v._id] || colors.en_attente;
                const Icon = color.icon;

                return (
                  <div key={v._id}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            background: color.bg,
                            borderRadius: 6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon size={14} color={color.text} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>
                          {color.label}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: color.text,
                        }}
                      >
                        {v.count}
                      </span>
                    </div>
                    <div
                      style={{
                        background: "var(--nk-line)",
                        borderRadius: 6,
                        height: 8,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${(v.count / maxVisites) * 100}%`,
                          background: color.text,
                          height: "100%",
                          borderRadius: 6,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Revenus et abonnements */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px,1fr))",
          gap: 20,
        }}
      >
        {/* Revenus par type d'abonnement */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>
            Revenus par type d'abonnement
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {data.revenusTotal.length === 0 ? (
              <p style={{ color: "var(--nk-ink-soft)" }}>Aucun revenu enregistré.</p>
            ) : (
              data.revenusTotal.map((r) => (
                <div key={r._id} style={{ borderBottom: "1px solid var(--nk-line)", paddingBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {r._id || "N/A"}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--nk-green-600)" }}>
                      {new Intl.NumberFormat("fr-FR").format(r.total)} FCFA
                    </p>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--nk-ink-soft)" }}>
                    {r.count} transaction{r.count > 1 ? "s" : ""}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Abonnements actifs */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>
            Abonnements actifs
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {data.abonnementsActifs.length === 0 ? (
              <p style={{ color: "var(--nk-ink-soft)" }}>Aucun abonnement actif.</p>
            ) : (
              data.abonnementsActifs.map((a) => {
                const colors = {
                  starter: "#667eea",
                  pro: "#f093fb",
                  premium: "#ffa502",
                };

                return (
                  <div key={a._id} style={{ borderBottom: "1px solid var(--nk-line)", paddingBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          textTransform: "capitalize",
                          color: colors[a._id] || "var(--nk-ink)",
                        }}
                      >
                        Pass {a._id}
                      </p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: colors[a._id] || "var(--nk-navy-900)" }}>
                        {a.count}
                      </p>
                    </div>
                    <div
                      style={{
                        background: "var(--nk-line)",
                        borderRadius: 6,
                        height: 6,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${(a.count / Math.max(1, ...data.abonnementsActifs.map((x) => x.count))) * 100}%`,
                          background: colors[a._id] || "var(--nk-navy-900)",
                          height: "100%",
                          borderRadius: 6,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Graphique des visites par mois */}
      {data.visitesParMois && data.visitesParMois.length > 0 && (
        <div className="card" style={{ padding: 24, marginTop: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>
            Visites par mois
          </h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200 }}>
            {data.visitesParMois.map((v, idx) => {
              const maxVal = Math.max(1, ...data.visitesParMois.map((x) => x.total));
              const height = (v.total / maxVal) * 150;
              const mois = new Date(2024, v._id.mois - 1).toLocaleString("fr-FR", {
                month: "short",
              });

              return (
                <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: "100%",
                      height: height,
                      background: "linear-gradient(180deg, #10b981, #059669)",
                      borderRadius: "6px 6px 0 0",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      paddingBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
                      {v.total}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      marginTop: 8,
                      textTransform: "capitalize",
                    }}
                  >
                    {mois}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Graphique des revenus par mois */}
      {data.revenusParMois && data.revenusParMois.length > 0 && (
        <div className="card" style={{ padding: 24, marginTop: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>
            Revenus par mois
          </h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200 }}>
            {data.revenusParMois.map((r, idx) => {
              const maxVal = Math.max(1, ...data.revenusParMois.map((x) => x.total));
              const height = (r.total / maxVal) * 150;
              const mois = new Date(2024, r._id.mois - 1).toLocaleString("fr-FR", {
                month: "short",
              });

              return (
                <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: "100%",
                      height: height,
                      background: "linear-gradient(180deg, #f59e0b, #d97706)",
                      borderRadius: "6px 6px 0 0",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      paddingBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>
                      {new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(r.total)}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      marginTop: 8,
                      textTransform: "capitalize",
                    }}
                  >
                    {mois}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
