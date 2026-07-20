import { useState, useEffect } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { FiCheckCircle, FiAlertCircle, FiLoader, FiEye, FiHome, FiClock, FiX } from "react-icons/fi";

const formatPhoneNumber = (value) => {
  const digits = value.replace(/\D/g, "");
  const groups = [];
  for (let i = 0; i < digits.length; i += 2) {
    groups.push(digits.slice(i, i + 2));
  }
  return groups.join(" ").trim().slice(0, 14);
};

const formatCardNumber = (value) => {
  const digits = value.replace(/\D/g, "");
  const groups = [];
  for (let i = 0; i < digits.length; i += 4) {
    groups.push(digits.slice(i, i + 4));
  }
  return groups.join(" ").trim().slice(0, 19);
};

const Payments = () => {
  const { updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("locataire"); // locataire ou proprietaire
  const [plans, setPlans] = useState({});
  const [planChoisi, setPlanChoisi] = useState(null);
  const [methode, setMethode] = useState("airtel_money");
  const [numeroContact, setNumeroContact] = useState("");
  const [phoneCode, setPhoneCode] = useState("+241");
  const [loading, setLoading] = useState(false);
  const [traitement, setTraitement] = useState(false);
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState("");
  const [validation, setValidation] = useState(null);
  const [historique, setHistorique] = useState([]);

  // Charger les plans
  useEffect(() => {
    loadPlans();
    loadHistorique();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await api.get(`/payments/plans/${activeTab}`);
      setPlans(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement des plans:", err);
    }
  };

  const loadHistorique = async () => {
    try {
      const response = await api.get("/payments");
      setHistorique(response.data);
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  const normalizePhoneContact = (value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.startsWith("0")) {
      return `${phoneCode}${digits.slice(1)}`;
    }
    if (digits.startsWith("241")) {
      return `+${digits}`;
    }
    if (value.startsWith("+")) {
      return `+${digits}`;
    }
    return `${phoneCode}${digits}`;
  };

  const validerPaiement = async () => {
    setErreur("");
    setValidation(null);
    setLoading(true);

    try {
      const contactValue = methode === "carte_bancaire" ? numeroContact : normalizePhoneContact(numeroContact);
      const response = await api.post("/payments/validate", {
        numeroContact: contactValue,
        methode,
        type: activeTab,
        plan: planChoisi,
      });
      setValidation(response.data);
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur de validation");
    } finally {
      setLoading(false);
    }
  };

  const confirmerPaiement = async () => {
    setTraitement(true);
    setErreur("");

    try {
      const contactValue = methode === "carte_bancaire" ? numeroContact : normalizePhoneContact(numeroContact);
      const response = await api.post("/payments", {
        montant: plans[planChoisi].montant,
        methode,
        type: activeTab,
        plan: planChoisi,
        numeroContact: contactValue,
      });

      let tentatives = 0;
      const checkPaiement = async () => {
        tentatives++;
        if (tentatives > 20) {
          setTraitement(false);
          return;
        }

        try {
          const paiement = await api.get(`/payments/${response.data._id}`);
          if (paiement.data.statut === "reussi") {
            setSucces(true);
            setTraitement(false);
            await loadHistorique();
            try {
              const meRes = await api.get("/auth/me");
              updateUser(meRes.data);
            } catch (refreshErr) {
              console.warn("Impossible de rafraîchir les informations utilisateur après paiement", refreshErr);
            }
            return;
          } else if (paiement.data.statut === "echoue") {
            setErreur("Le paiement a échoué. Veuillez réessayer.");
            setTraitement(false);
            return;
          }
          setTimeout(checkPaiement, 500);
        } catch (err) {
          setTimeout(checkPaiement, 500);
        }
      };

      setTimeout(checkPaiement, 500);
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur lors du paiement");
      setTraitement(false);
    }
  };

  const reinitialiser = () => {
    setPlanChoisi(null);
    setNumeroContact("");
    setMethode("airtel_money");
    setValidation(null);
    setSucces(false);
    setErreur("");
    setTraitement(false);
  };

  const plansList = Object.entries(plans).map(([key, value]) => ({
    id: key,
    ...value,
  }));

  const PLAN_COLORS = {
    standard: { color: "#667eea", bg: "#667eea" },
    premium: { color: "#f093fb", bg: "#f093fb" },
    golden: { color: "#ffa502", bg: "#ffa502" },
  };

  return (
    <div className="container" style={{ padding: "clamp(24px, 4vw, 36px) clamp(16px, 4vw, 24px) clamp(40px, 5vw, 60px)" }}>
      <h1 style={{ fontSize: "clamp(24px, 5vw, 28px)", marginBottom: "clamp(6px, 1.5vw, 8px)" }}>Mes Abonnements</h1>
      <p style={{ marginBottom: "clamp(20px, 3vw, 28px)", color: "var(--nk-ink-soft)", fontSize: "clamp(14px, 2vw, 15px)" }}>
        {activeTab === "locataire"
          ? "Trouvez le plan adapté à votre recherche de logement"
          : "Publiez vos annonces avec les meilleures options"}
      </p>

      {/* Onglets */}
      <div style={{ display: "flex", gap: "clamp(6px, 2vw, 8px)", marginBottom: "clamp(20px, 3vw, 28px)", flexWrap: "wrap" }}>
        <button
          onClick={() => {
            setActiveTab("locataire");
            loadPlans();
            reinitialiser();
          }}
          style={{
            flex: 1,
            minWidth: "clamp(140px, 45vw, 200px)",
            padding: "clamp(10px, 2vw, 12px) clamp(14px, 2vw, 20px)",
            borderRadius: 8,
            border: `2px solid ${activeTab === "locataire" ? "var(--nk-navy-900)" : "var(--nk-line)"}`,
            background: activeTab === "locataire" ? "var(--nk-navy-900)" : "#fff",
            color: activeTab === "locataire" ? "#fff" : "var(--nk-ink)",
            fontWeight: 600,
            fontSize: "clamp(13px, 2vw, 14px)",
            cursor: "pointer",
            minHeight: 44,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><FiEye size={16} /> <span style={{ display: 'none' }} className="nk-hidden-mobile">Chercheur</span></span>
        </button>
        <button
          onClick={() => {
            setActiveTab("proprietaire");
            loadPlans();
            reinitialiser();
          }}
          style={{
            flex: 1,
            minWidth: "clamp(140px, 45vw, 200px)",
            padding: "clamp(10px, 2vw, 12px) clamp(14px, 2vw, 20px)",
            borderRadius: 8,
            border: `2px solid ${activeTab === "proprietaire" ? "var(--nk-navy-900)" : "var(--nk-line)"}`,
            background: activeTab === "proprietaire" ? "var(--nk-navy-900)" : "#fff",
            color: activeTab === "proprietaire" ? "#fff" : "var(--nk-ink)",
            fontWeight: 600,
            fontSize: "clamp(13px, 2vw, 14px)",
            cursor: "pointer",
            minHeight: 44,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><FiHome size={16} /> Propriétaire</span>
        </button>
      </div>

      {/* Grille des plans */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(clamp(240px, 45vw, 280px),1fr))", gap: "clamp(14px, 3vw, 20px)", marginBottom: "clamp(28px, 4vw, 40px)" }}>
        {plansList.map((p) => {
          const colors = PLAN_COLORS[p.id] || PLAN_COLORS.standard;

          return (
            <div
              key={p.id}
              className="card"
              style={{
                padding: "clamp(18px, 3vw, 24px)",
                border: planChoisi === p.id ? `3px solid ${colors.color}` : "1px solid var(--nk-line)",
                position: "relative",
                overflow: "hidden",
                background: planChoisi === p.id ? `${colors.color}08` : "#fff",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: colors.color }} />

              <h3 style={{ fontSize: "clamp(18px, 3vw, 20px)", fontWeight: 700, color: colors.color }}>{p.nom}</h3>
              <p style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 700, marginTop: "clamp(8px, 2vw, 12px)", color: "var(--nk-navy-900)" }}>
                {new Intl.NumberFormat("fr-FR").format(p.montant)}
                <span style={{ fontSize: "clamp(13px, 2vw, 16px)", fontWeight: 400, color: "var(--nk-ink-soft)" }}> FCFA</span>
              </p>
              <p style={{ fontSize: "clamp(11px, 2vw, 12px)", color: "var(--nk-ink-soft)", marginTop: 4 }}>par mois</p>

              <div style={{ background: `${colors.color}10`, padding: "clamp(10px, 2vw, 14px)", borderRadius: 8, marginTop: "clamp(12px, 2vw, 16px)" }}>
                <p style={{ fontSize: "clamp(12px, 2vw, 13px)", fontWeight: 600, color: "var(--nk-ink)", marginBottom: 4 }}>
                  {p.description}
                </p>
              </div>

              <button
                onClick={() => {
                  setPlanChoisi(p.id);
                  setSucces(false);
                  setErreur("");
                  setValidation(null);
                }}
                style={{
                  width: "100%",
                  padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                  marginTop: "clamp(14px, 3vw, 20px)",
                  background: planChoisi === p.id ? colors.color : "var(--nk-line)",
                  color: planChoisi === p.id ? "#fff" : "var(--nk-ink)",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: "clamp(13px, 2vw, 14px)",
                  cursor: "pointer",
                  minHeight: 44,
                }}
              >
                {planChoisi === p.id ? "Plan sélectionné" : "Choisir ce plan"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Formulaire de paiement */}
      {planChoisi && (
        <div className="card" style={{ padding: "clamp(20px, 4vw, 28px)", maxWidth: "min(100%, 500px)", margin: "0 auto", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(10px, 2vw, 12px)", marginBottom: "clamp(14px, 3vw, 20px)" }}>
            <div style={{ fontSize: "clamp(22px, 4vw, 28px)" }}>
              {activeTab === "locataire" ? <FiEye /> : <FiHome />}
            </div>
            <div>
              <p style={{ fontSize: "clamp(11px, 2vw, 12px)", color: "var(--nk-ink-soft)", textTransform: "uppercase", fontWeight: 600 }}>
                {activeTab === "locataire" ? "Chercheur" : "Propriétaire"}
              </p>
              <h3 style={{ fontSize: "clamp(16px, 3vw, 18px)", fontWeight: 700 }}>{plans[planChoisi]?.nom}</h3>
            </div>
          </div>

          {/* Succès */}
          {succes && (
            <div style={{ background: "#ecfdf5", border: "1px solid #d1fae5", borderRadius: 8, padding: "clamp(12px, 2vw, 16px)", marginBottom: "clamp(14px, 3vw, 20px)" }}>
              <p style={{ color: "#047857", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, fontSize: "clamp(13px, 2vw, 14px)" }}>
                <FiCheckCircle size={18} /> Paiement réussi ! Votre abonnement est actif.
              </p>
            </div>
          )}

          {/* Erreur */}
          {erreur && (
            <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 8, padding: "clamp(12px, 2vw, 16px)", marginBottom: "clamp(14px, 3vw, 20px)" }}>
              <p style={{ color: "#dc2626", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, fontSize: "clamp(13px, 2vw, 14px)" }}>
                <FiAlertCircle size={18} /> {erreur}
              </p>
            </div>
          )}

          {!succes && !traitement && (
            <>
              {!validation ? (
                <>
<div style={{ marginBottom: "clamp(14px, 3vw, 20px)" }}>
                <label style={{ fontSize: "clamp(12px, 2vw, 13px)", fontWeight: 600, marginBottom: "clamp(6px, 1vw, 8px)", display: "block" }}>
                  Méthode de paiement
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(clamp(90px, 30vw, 120px), 1fr))", gap: "clamp(8px, 2vw, 10px)" }}>
                  {[
                    ["airtel_money", "Airtel Money"],
                    ["moov_money", "Moov Money"],
                    ["carte_bancaire", "Carte"],
                  ].map(([v, l]) => (
                    <button
                      key={v}
                      onClick={() => {
                        setMethode(v);
                        setValidation(null);
                      }}
                      style={{
                        padding: "clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 16px)",
                        borderRadius: 8,
                        border: `2px solid ${methode === v ? "var(--nk-navy-900)" : "var(--nk-line)"}`,
                        background: methode === v ? "rgba(13, 43, 79, 0.1)" : "#fff",
                        color: methode === v ? "var(--nk-navy-900)" : "var(--nk-ink)",
                        fontWeight: 600,
                        fontSize: "clamp(11px, 2vw, 12px)",
                        cursor: "pointer",
                        minHeight: 44,
                          }}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: "clamp(14px, 3vw, 20px)" }}>
                    <label style={{ fontSize: "clamp(12px, 2vw, 13px)", fontWeight: 600, marginBottom: "clamp(6px, 1vw, 8px)", display: "block" }}>
                      {methode === "carte_bancaire" ? "Numéro de carte" : "Numéro de téléphone"}
                    </label>
                    <div style={{ display: 'flex', gap: "clamp(6px, 2vw, 8px)", flexWrap: "wrap" }}>
                      {methode !== "carte_bancaire" && (
                        <select value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} style={{ padding: "clamp(10px, 2vw, 12px)", borderRadius: 8, border: '1px solid var(--nk-line)', background: '#fff', fontSize: "clamp(13px, 2vw, 14px)", flex: "0 0 auto", minWidth: "clamp(100px, 35vw, 140px)" }}>
                          <option value="+241">+241 (Gabon)</option>
                          <option value="+229">+229 (Bénin)</option>
                          <option value="+228">+228 (Togo)</option>
                          <option value="+225">+225 (Côte d'Ivoire)</option>
                          <option value="+237">+237 (Cameroun)</option>
                        </select>
                      )}
                      <input
                        type="text"
                        placeholder={methode === "carte_bancaire" ? "1234 5678 9012 3456" : "65 00 00 00 00"}
                        value={numeroContact}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNumeroContact(methode === "carte_bancaire" ? formatCardNumber(value) : formatPhoneNumber(value));
                          setValidation(null);
                        }}
                        style={{
                          flex: 1,
                          minWidth: "clamp(140px, 50vw, 200px)",
                          padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 14px)",
                          border: "1px solid var(--nk-line)",
                          borderRadius: 8,
                          fontSize: "clamp(13px, 2vw, 14px)",
                          fontFamily: "monospace",
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={validerPaiement}
                    disabled={!numeroContact || loading}
                    style={{
                      width: "100%",
                      padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                      background: "var(--nk-navy-900)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: "clamp(13px, 2vw, 14px)",
                      cursor: numeroContact ? "pointer" : "not-allowed",
                      opacity: numeroContact ? 1 : 0.6,
                      minHeight: 44,
                    }}
                  >
                    {loading ? "Validation..." : "Continuer"}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ background: "rgba(13, 43, 79, 0.05)", padding: "clamp(12px, 2vw, 16px)", borderRadius: 8, marginBottom: "clamp(14px, 3vw, 20px)" }}>
                    <p style={{ fontSize: "clamp(12px, 2vw, 13px)", fontWeight: 600, marginBottom: "clamp(6px, 1vw, 8px)" }}>✓ Informations validées</p>
                    <p style={{ fontSize: "clamp(12px, 2vw, 13px)", marginBottom: 6 }}>
                      <span style={{ color: "var(--nk-ink-soft)" }}>Montant:</span>{" "}
                      <span style={{ fontWeight: 600 }}>
                        {new Intl.NumberFormat("fr-FR").format(plans[planChoisi].montant)} FCFA
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={confirmerPaiement}
                    style={{
                      width: "100%",
                      padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                      background: "var(--nk-navy-900)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: "clamp(13px, 2vw, 14px)",
                      cursor: "pointer",
                      marginBottom: "clamp(8px, 2vw, 10px)",
                      minHeight: 44,
                    }}
                  >
                    Confirmer le paiement
                  </button>

                  <button
                    onClick={() => setValidation(null)}
                    style={{
                      width: "100%",
                      padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                      background: "transparent",
                      color: "var(--nk-navy-900)",
                      border: "2px solid var(--nk-navy-900)",
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: "clamp(13px, 2vw, 14px)",
                      cursor: "pointer",
                      minHeight: 44,
                    }}
                  >
                    Modifier
                  </button>
                </>
              )}
            </>
          )}

          {/* Chargement */}
          {traitement && (
            <div style={{ textAlign: "center", padding: "clamp(14px, 3vw, 20px) 0" }}>
              <div style={{ animation: "spin 1s linear infinite", display: "inline-block", marginBottom: "clamp(12px, 2vw, 16px)" }}>
                <FiLoader size={32} color="var(--nk-navy-900)" />
              </div>
              <p style={{ fontSize: "clamp(14px, 2vw, 16px)", fontWeight: 600, marginBottom: "clamp(6px, 1vw, 8px)" }}>Traitement du paiement...</p>
              <p style={{ fontSize: "clamp(12px, 2vw, 13px)", color: "var(--nk-ink-soft)" }}>Veuillez patienter quelques secondes</p>
            </div>
          )}

          {succes && (
            <button
              onClick={reinitialiser}
              style={{
                width: "100%",
                padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                background: "var(--nk-navy-900)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: "clamp(13px, 2vw, 14px)",
                cursor: "pointer",
                minHeight: 44,
              }}
            >
              Choisir un autre plan
            </button>
          )}

          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Historique */}
      <h2 style={{ fontSize: "clamp(19px, 4vw, 21px)", marginTop: "clamp(28px, 4vw, 40px)", marginBottom: "clamp(12px, 2vw, 16px)" }}>Historique des paiements</h2>
      {historique.length === 0 ? (
        <p style={{ color: "var(--nk-ink-soft)", textAlign: "center", padding: "clamp(20px, 3vw, 32px) clamp(12px, 2vw, 16px)", fontSize: "clamp(14px, 2vw, 15px)" }}>
          Aucun paiement effectué pour le moment.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(10px, 2vw, 12px)" }}>
          {historique.map((h) => (
            <div
              key={h._id}
              className="card"
              style={{
                padding: "clamp(12px, 2vw, 16px)",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "clamp(12px, 2vw, 16px)",
                alignItems: "center",
                fontSize: "clamp(12px, 2vw, 13.5px)",
              }}
            >
              <div>
                <p style={{ fontSize: "clamp(11px, 2vw, 12px)", color: "var(--nk-ink-soft)", marginTop: 2 }}>
                  {h.type === "locataire" ? (<span style={{display:'inline-flex',alignItems:'center',gap:6}}><FiEye size={14} /> Chercheur</span>) : (<span style={{display:'inline-flex',alignItems:'center',gap:6}}><FiHome size={14} /> Propriétaire</span>)} - {h.plan}
                </p>
                <p style={{ fontSize: "clamp(11px, 2vw, 12px)", color: "var(--nk-ink-soft)", marginTop: "clamp(4px, 1vw, 6px)" }}>
                  {new Date(h.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: 600, fontSize: "clamp(13px, 2vw, 14px)", marginBottom: "clamp(4px, 1vw, 6px)" }}>
                  {new Intl.NumberFormat("fr-FR").format(h.montant)} FCFA
                </p>
                <p
                  style={{
                    color: h.statut === "reussi" ? "var(--nk-green-600)" : h.statut === "en_traitement" ? "#f59e0b" : "var(--nk-danger)",
                    fontWeight: 600,
                    fontSize: "clamp(11px, 2vw, 12px)",
                    display: 'inline-flex',
                    alignItems:'center',
                    gap: 4,
                  }}
                >
                  {h.statut === "reussi" ? (<span style={{display:'inline-flex',alignItems:'center',gap:4}}><FiCheckCircle size={14} /> Réussi</span>) : h.statut === "en_traitement" ? (<span style={{display:'inline-flex',alignItems:'center',gap:4}}><FiClock size={14} /> En traitement</span>) : (<span style={{display:'inline-flex',alignItems:'center',gap:4}}><FiX size={14} /> Échoué</span>)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Payments;
