# Lancement du projet Mon Nkama

## 1. Prérequis
- Node.js 18+ installé
- MongoDB en local ou accès à une base distante

## 2. Installation
### Backend
```bash
cd server
npm install
```

### Frontend
```bash
cd client
npm install
```

## 3. Démarrage
### Backend
```bash
cd server
npm run seed
npm run dev
```
Le serveur tourne généralement sur `http://localhost:5000`.

#### Comptes créés par `npm run seed`
- Admin : `admin@test.com` / `Admin@1234`
- Propriétaire : `alex.ngoma@test.com` / `Admin@1234`
- Locataire : `claire.moussavou@test.com` / `Admin@1234`

> Les autres utilisateurs générés utilisent le même mot de passe `Admin@1234`.

### Frontend
```bash
cd client
npm run dev
```
L’application React démarre généralement sur `http://localhost:5173`.

## 4. Où placer les images
### Dossier `images/` à la racine
Si tu veux que le seed utilise tes photos d’annonces, place ton dossier dans la racine du projet sous le nom exact :
- `images/`

Le script `server/src/seed.js` va copier les images valides (`.jpg`, `.png`, `.webp`, `.gif`) de ce dossier vers `server/src/uploads/listings/`.

### Logo et images statiques du client
Pour les images utilisées par l’interface React, place-les ici :
- `client/public/logo/` pour les images publiques
- `client/src/assets/` pour les images importées dans le code React

### Exemple concret
Si ton logo s’appelle `logo.png`, copie-le dans :
- `client/public/logo/logo.png`
- et/ou `client/src/assets/logo.png`

## 5. Notes utiles
- Les images stockées dans `client/public/` sont servies directement par Vite.
- Les images de profil / annonces uploadées sont gérées côté backend dans `server/src/uploads/`.
- Si tu veux remplacer le logo du site, remplace simplement le fichier existant `logo.png` dans `client/public/logo/`.

## 6. Vérifier
- Ouvre `http://localhost:5173` dans le navigateur
- Vérifie que le logo et les images s’affichent correctement
