# MON NKAMA — Application Web

Application web complète (React + Express + MongoDB) pour la recherche et la publication de logements au Gabon.
"MON NKAMA, le tiers de confiance entre propriétaires et locataires."

## Structure du projet

```
mon-nkama/
├── server/          → API Express + MongoDB (Node.js, ESM)
│   └── src/
│       ├── models/      → Schémas Mongoose (User, Listing, Appointment, ...)
│       ├── routes/      → Routes API REST
│       ├── middleware/  → Authentification JWT, upload de fichiers
│       └── uploads/     → Photos uploadées (logements, profils)
└── client/          → Application React (Vite)
    └── src/
        ├── pages/        → Écrans de l'application
        ├── components/   → Composants réutilisables (Navbar, Logo, ListingCard...)
        ├── context/      → Contexte d'authentification
        └── assets/       → Logo et ressources statiques
```

## 📍 Où placer le logo

Le logo que tu as fourni est déjà intégré à deux endroits :

1. `client/src/assets/logo.png` → utilisé partout dans l'interface (Navbar, écran d'accueil, connexion...)
2. `client/public/logo/logo.png` → utilisé comme favicon du site (onglet du navigateur)

**Pour changer le logo plus tard**, remplace simplement ces deux fichiers par ta nouvelle image en gardant
exactement le même nom (`logo.png`). Aucune autre modification de code n'est nécessaire.

## Prérequis

- Node.js 18+
- MongoDB (local via `mongodb://localhost:27017` ou un cluster MongoDB Atlas)

## Installation et lancement

### 1. Backend (API)

```bash
cd server
npm install
cp .env.example .env
# Modifie .env si besoin (URI MongoDB, secret JWT...)
npm run seed     # crée des comptes et annonces de démonstration
npm run dev      # démarre le serveur sur http://localhost:5000
```

Comptes de démonstration créés par `npm run seed` :
- Admin : `admin@monnkama.ga` / `password123`
- Propriétaire : `proprietaire@monnkama.ga` / `password123`
- Locataire : `client@monnkama.ga` / `password123`

### 2. Frontend (application web)

Dans un second terminal :

```bash
cd client
npm install
npm run dev      # démarre l'application sur http://localhost:5173
```

Ouvre ensuite **http://localhost:5173** dans ton navigateur.

## Fonctionnalités incluses

- **Écran d'accueil** avec logo, slogan et boutons Se connecter / Créer un compte / Continuer comme visiteur
- **Authentification** avec choix du profil (locataire, propriétaire, agence) et rôle administrateur
- **Recherche de logements** avec filtres (ville, quartier, budget, pièces, équipements...) et affichage grille / liste / carte
- **Fiche logement détaillée** : galerie photo, équipements, localisation sur carte interactive (OpenStreetMap/Leaflet), contact téléphone/WhatsApp/messagerie
- **Favoris** avec comparaison de logements
- **Prise de rendez-vous** de visite avec génération d'un code QR de confirmation
- **Messagerie interne** sécurisée entre locataires et bailleurs
- **Notifications**
- **Paiements** (simulation Airtel Money, Moov Money, carte bancaire) et abonnements Standard / Premium / Golden
- **Espace bailleur** : publication, modification, suppression d'annonces, tableau de bord
- **Espace administrateur** : statistiques, gestion des utilisateurs, validation des propriétaires, modération des annonces, signalements, tableau de bord financier
- **Carte interactive** de tous les logements géolocalisés

## Notes techniques

- L'upload de photos est géré par `multer`, les fichiers sont stockés dans `server/src/uploads/` et servis statiquement.
- La carte interactive utilise `react-leaflet` avec les tuiles gratuites OpenStreetMap (aucune clé API requise).
- Les paiements Airtel Money / Moov Money sont **simulés** (pas d'intégration réelle avec un opérateur) — à connecter à une vraie API de paiement mobile pour la production.
- Pense à changer `JWT_SECRET` dans `.env` avant toute mise en production.
