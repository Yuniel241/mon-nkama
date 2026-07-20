import { useState, useEffect } from "react";
import api from "../api/axios.js";
import ListingCard from "../components/ListingCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Favorites = () => {
  const { user } = useAuth();
  const [favoris, setFavoris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compare, setCompare] = useState([]);

  useEffect(() => {
    api.get("/favorites").then((res) => {
      setFavoris(res.data);
      setLoading(false);
    });
  }, []);

  const toggleCompare = (id) => {
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < 3 ? [...c, id] : c));
  };

  const logementsCompares = favoris.filter((f) => compare.includes(f.logement._id)).map((f) => f.logement);

  return (
    <div className="container" style={{ padding: "36px 24px 60px" }}>
      <h1 style={{ fontSize: 28 }}>Mes favoris</h1>
      <p style={{ marginTop: 6 }}>Retrouvez ici les logements que vous avez enregistrés. Sélectionnez jusqu'à 3 annonces pour les comparer.</p>

      {loading ? (
        <p style={{ marginTop: 40 }}>Chargement...</p>
      ) : favoris.length === 0 ? (
        <p style={{ marginTop: 40 }}>Vous n'avez pas encore de favoris.</p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 20, marginTop: 28 }}>
            {favoris.map((f) => (
              <div key={f._id} style={{ position: "relative" }}>
                <label
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: 2,
                    background: "#fff",
                    borderRadius: 8,
                    padding: "4px 8px",
                    fontSize: 12,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    boxShadow: "var(--nk-shadow-sm)",
                  }}
                >
                  <input type="checkbox" checked={compare.includes(f.logement._id)} onChange={() => toggleCompare(f.logement._id)} />
                  Comparer
                </label>
                <ListingCard 
                  logement={f.logement}
                  userSubscription={user ? {
                    pack: user.abonnementLocataire,
                    dateExpiration: user.dateFinAbonnementLocataire
                  } : null}
                />
              </div>
            ))}
          </div>

          {logementsCompares.length > 1 && (
            <div style={{ marginTop: 40 }}>
              <h2 style={{ fontSize: 21 }}>Comparaison</h2>
              <div style={{ overflowX: "auto", marginTop: 16 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12, overflow: "hidden" }}>
                  <thead>
                    <tr style={{ background: "var(--nk-navy-900)", color: "#fff" }}>
                      <th style={{ padding: 12, textAlign: "left" }}>Critère</th>
                      {logementsCompares.map((l) => (
                        <th key={l._id} style={{ padding: 12, textAlign: "left" }}>{l.titre}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Prix", (l) => new Intl.NumberFormat("fr-FR").format(l.prix) + " FCFA"],
                      ["Ville", (l) => l.ville],
                      ["Quartier", (l) => l.quartier],
                      ["Pièces", (l) => l.pieces],
                      ["Meublé", (l) => (l.meuble ? "Oui" : "Non")],
                      ["Internet", (l) => (l.internet ? "Oui" : "Non")],
                      ["Parking", (l) => (l.parking ? "Oui" : "Non")],
                    ].map(([label, fn]) => (
                      <tr key={label} style={{ borderTop: "1px solid var(--nk-line)" }}>
                        <td style={{ padding: 12, fontWeight: 600 }}>{label}</td>
                        {logementsCompares.map((l) => (
                          <td key={l._id} style={{ padding: 12 }}>{fn(l)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Favorites;
