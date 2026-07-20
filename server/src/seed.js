import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Listing from "./models/Listing.js";
import Appointment from "./models/Appointment.js";
import Conversation from "./models/Conversation.js";
import Report from "./models/Report.js";
import Notification from "./models/Notification.js";
import Payment from "./models/Payment.js";

dotenv.config();

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const ROOM_TYPES = ["chambre", "studio", "appartement", "maison"];
const PROVINCES = ["Estuaire", "Haut-Ogooué", "Moyen-Ogooué", "Ogooué-Ivindo", "Ogooué-Lolo", "Ngounié", "Nyanga", "Ogooué-Maritime", "Woleu-Ntem"];
const CITIES = {
  "Estuaire": ["Libreville", "Owendo", "Kango","Akanda","Ntoum"],
  "Haut-Ogooué": ["Franceville", "Moanda", "Leconi"],
  "Moyen-Ogooué": ["Lambaréné", "Ndjolé"],
  "Ogooué-Ivindo": ["Makokou", "Booué"],
  "Ogooué-Lolo": ["Koulamoutou", "Iboundji"],
  "Ngounié": ["Mouila", "Fougamou"],
  "Nyanga": ["Tchibanga", "Mayumba"],
  "Ogooué-Maritime": ["Port-Gentil", "Gamba"],
  "Woleu-Ntem": ["Oyem", "Mitzic"]
};
const NEIGHBORHOODS = ["Glass", "Akanda", "Owendo", "Nzeng-Ayong", "Bordeaux", "Cocotier", "Brazza", "St Michel"];
const TITLES = [
  "Appartement lumineux à louer",
  "Studio cosy proche du centre",
  "Maison avec jardin privé",
  "Chambre sécurisée en location",
  "Appartement meublé avec balcon",
  "Studio moderne tout équipé",
  "Maison familiale proche école",
  "Appartement de standing",
  "Chambre confortable en résidence",
  "Studio calme et sécurisé"
];
const DESCRIPTIONS = [
  "Logement bien entretenu, idéal pour une petite famille ou un professionnel.",
  "Emplacement central, proche des transports et commerces.",
  "Espace lumineux avec cuisine équipée et balcon.",
  "Confort moderne, eau et électricité incluses.",
  "Quartier calme, accès facile aux écoles et bureaux.",
  "Ambiance sécurisée, proche de tous les services.",
  "Très beau logement rénové récemment.",
  "Excellente opportunité pour location longue durée."
];
const PAYMENT_METHODS = ["airtel_money", "moov_money", "carte_bancaire"];
const PAYMENT_PLAN_PRICES = { standard: 1500, premium: 3000, golden: 5000 };
const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

const randomFromArray = (items) => items[Math.floor(Math.random() * items.length)];
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDateBetween = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..", "..");
const imageSourceCandidates = [
  path.join(projectRoot, "images"),
  path.join(projectRoot, "image"),
  path.join(projectRoot, "image", "sylvana-mon-nkama"),
  path.join(projectRoot, "image", "sylvana mon nkama"),
];
const listingUploadBase = path.join(__dirname, "uploads", "listings");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const imageFolder = imageSourceCandidates.find((dir) => fs.existsSync(dir) && fs.statSync(dir).isDirectory());
const localListingImages = imageFolder
  ? fs.readdirSync(imageFolder).filter((file) => /\.(jpe?g|png|webp|gif)$/i.test(file)).map((file) => path.join(imageFolder, file))
  : [];

const copyListingImage = (sourcePath, listingId, index) => {
  ensureDir(listingUploadBase);
  const ext = path.extname(sourcePath).toLowerCase();
  const destinationFile = `listing-${listingId}-${index}${ext}`;
  const destinationPath = path.join(listingUploadBase, destinationFile);
  fs.copyFileSync(sourcePath, destinationPath);
  return `/uploads/listings/${destinationFile}`;
};

const buildPhotoGroup = () => [];

const buildListingData = (index, ownerId, createdAt) => {
  const province = randomFromArray(PROVINCES);
  const ville = randomFromArray(CITIES[province]);
  const quartier = randomFromArray(NEIGHBORHOODS);
  const type = randomFromArray(ROOM_TYPES);
  const baseLat = 0.4162 + Math.random() * 0.2 - 0.1;
  const baseLng = 9.4673 + Math.random() * 0.2 - 0.1;

  return {
    titre: TITLES[index % TITLES.length],
    description: DESCRIPTIONS[index % DESCRIPTIONS.length],
    type,
    prix: randomBetween(type === "maison" ? 850000 : type === "appartement" ? 250000 : 100000, type === "maison" ? 1200000 : type === "appartement" ? 500000 : 180000),
    province,
    ville,
    quartier,
    adresse: `${randomFromArray(["Rue des Orchidées", "Avenue du Boulevard", "Rue du Marché", "Impasse des Palmiers"])}, ${quartier}`,
    pieces: type === "chambre" ? 1 : type === "studio" ? 1 : randomBetween(2, 5),
    sallesDeBain: type === "chambre" ? 1 : randomBetween(1, 3),
    meuble: Math.random() < 0.7,
    internet: Math.random() < 0.8,
    parking: Math.random() < 0.6,
    climatisation: Math.random() < 0.5,
    cuisineEquipee: Math.random() < 0.7,
    animauxAutorises: Math.random() < 0.4,
    disponibleImmediatement: Math.random() < 0.85,
    photos: buildPhotoGroup(),
    proprietaire: ownerId,
    packProprietaire: randomFromArray(["standard", "premium", "golden"]),
    statut: Math.random() < 0.8 ? "verifiee" : "en_attente",
    premium: Math.random() < 0.35,
    vues: randomBetween(20, 420),
    latitude: Number(baseLat.toFixed(6)),
    longitude: Number(baseLng.toFixed(6)),
    createdAt,
    updatedAt: createdAt,
  };
};

const buildRejectedListingData = (index, ownerId, createdAt) => {
  const province = randomFromArray(PROVINCES);
  const ville = randomFromArray(CITIES[province]);
  const quartier = randomFromArray(NEIGHBORHOODS);
  const type = randomFromArray(ROOM_TYPES);
  const baseLat = 0.4162 + Math.random() * 0.2 - 0.1;
  const baseLng = 9.4673 + Math.random() * 0.2 - 0.1;

  return {
    titre: `${TITLES[index % TITLES.length]} (rejetée)`,
    description: `Annonce rejetée : ${DESCRIPTIONS[index % DESCRIPTIONS.length]}`,
    type,
    prix: randomBetween(type === "maison" ? 850000 : type === "appartement" ? 250000 : 100000, type === "maison" ? 1200000 : type === "appartement" ? 500000 : 180000),
    province,
    ville,
    quartier,
    adresse: `${randomFromArray(["Rue des Orchidées", "Avenue du Boulevard", "Rue du Marché", "Impasse des Palmiers"])}, ${quartier}`,
    pieces: type === "chambre" ? 1 : type === "studio" ? 1 : randomBetween(2, 5),
    sallesDeBain: type === "chambre" ? 1 : randomBetween(1, 3),
    meuble: Math.random() < 0.7,
    internet: Math.random() < 0.8,
    parking: Math.random() < 0.6,
    climatisation: Math.random() < 0.5,
    cuisineEquipee: Math.random() < 0.7,
    animauxAutorises: Math.random() < 0.4,
    disponibleImmediatement: false,
    photos: [],
    proprietaire: ownerId,
    packProprietaire: randomFromArray(["standard", "premium", "golden"]),
    statut: "rejetee",
    premium: false,
    vues: randomBetween(0, 40),
    latitude: Number(baseLat.toFixed(6)),
    longitude: Number(baseLng.toFixed(6)),
    motifRejet: "Annonce sans images",
    createdAt,
    updatedAt: createdAt,
  };
};

const buildMessage = (expediteur, contenu, date, type = "texte", lu = false) => ({
  expediteur,
  contenu,
  type,
  date,
  lu,
});

const buildConversationData = (participants, logement, startDate) => {
  const messagesCount = randomBetween(3, 8);
  const messages = [];
  let messageDate = new Date(startDate);

  for (let i = 0; i < messagesCount; i += 1) {
    const expediteur = participants[i % participants.length];
    const contenu = randomFromArray([
      "Bonjour, êtes-vous toujours intéressé(e) ?",
      "Oui, je souhaite visiter cette semaine.",
      "Pouvez-vous m’indiquer la superficie exacte ?",
      "Je suis disponible jeudi matin.",
      "Le logement est-il toujours libre ?",
      "Merci pour ces informations.",
      "Je confirme ma visite.",
      "Est-ce que les charges sont incluses ?",
      "Je veux finaliser la réservation.",
      "Comment puis-je signer le contrat ?"
    ]);
    messages.push(buildMessage(expediteur, contenu, messageDate, "texte", i > 0));
    messageDate = addDays(messageDate, randomBetween(1, 3));
  }

  return {
    participants,
    logement,
    messages,
    createdAt: startDate,
    updatedAt: messageDate,
  };
};

const buildNotification = (utilisateur, type, message, lien, date) => ({
  utilisateur,
  type,
  message,
  lien,
  lu: Math.random() < 0.5,
  createdAt: date,
  updatedAt: date,
});

const buildReport = (utilisateur, logement, utilisateurSignale, motif, details, statut, date) => ({
  utilisateur,
  logement,
  utilisateurSignale,
  motif,
  details,
  statut,
  createdAt: date,
  updatedAt: date,
});

const buildPaymentData = (user, type, plan, startDate) => ({
  utilisateur: user._id,
  montant: PAYMENT_PLAN_PRICES[plan],
  methode: randomFromArray(PAYMENT_METHODS),
  numeroContact:
    type === "proprietaire"
      ? `4242 4242 4242 ${randomBetween(1000, 9999)}`
      : `+241 ${randomBetween(60, 99)} ${randomBetween(0, 99).toString().padStart(2, "0")} ${randomBetween(0, 99).toString().padStart(2, "0")} ${randomBetween(0, 99).toString().padStart(2, "0")}`,
  type,
  plan,
  statut: "reussi",
  reference: `MNK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  dateDebut: startDate,
  dateFin: addDays(startDate, 30),
  dureeJours: 30,
  createdAt: startDate,
  updatedAt: startDate,
});

const randomDistinctPair = (items) => {
  const a = randomFromArray(items);
  let b = randomFromArray(items);
  while (items.length > 1 && b._id.toString() === a._id.toString()) {
    b = randomFromArray(items);
  }
  return [a, b];
};

const run = async () => {
  await connectDB();

  console.log("Nettoyage des collections : users, listings, appointments, conversations, reports, notifications, payments...");
  await User.deleteMany({});
  await Listing.deleteMany({});
  await Appointment.deleteMany({});
  await Conversation.deleteMany({});
  await Report.deleteMany({});
  await Notification.deleteMany({});
  await Payment.deleteMany({});

  const passwordHash = await bcrypt.hash("Admin@1234", 10);

  await User.create({
    nom: "Admin",
    prenom: "MonNkama",
    telephone: "+24174000000",
    email: "admin@test.com",
    motDePasse: passwordHash,
    role: "admin",
    verifie: true,
  });

  const userEntries = [
    {
      prenom: "Test",
      nom: "Locataire",
      telephone: "+24174088888",
      role: "locataire",
      abonnementLocataire: "premium",
      dateDebut: addDays(new Date(), -10),
      dateFin: addDays(new Date(), 20),
    },
    {
      prenom: "Test",
      nom: "Proprietaire",
      telephone: "+24174099999",
      role: "proprietaire",
      abonnementProprietaire: "premium",
      dateDebut: addDays(new Date(), -10),
      dateFin: addDays(new Date(), 20),
    },
    { prenom: "Alex", nom: "Ngoma", telephone: "+24174011111" },
    { prenom: "Claire", nom: "Moussavou", telephone: "+24174022222" },
    { prenom: "Jean", nom: "Lema", telephone: "+24174033333" },
    { prenom: "Sophie", nom: "Koumba", telephone: "+24174044444" },
    { prenom: "Paul", nom: "Ondo", telephone: "+24174055555" },
    { prenom: "Awa", nom: "Djouma", telephone: "+24174066666" },
    { prenom: "Leon", nom: "Teka", telephone: "+24174077777" },
  ];

  const users = [];
  for (let i = 0; i < userEntries.length; i += 1) {
    const entry = userEntries[i];
    const role = entry.role || (i % 2 === 0 ? "proprietaire" : "locataire");
    const dateDebut = entry.dateDebut || addDays(new Date(), -randomBetween(10, 90));
    const dateFin = entry.dateFin || addDays(dateDebut, randomBetween(30, 60));

    const user = await User.create({
      prenom: entry.prenom,
      nom: entry.nom,
      telephone: entry.telephone,
      email: `${entry.prenom.toLowerCase()}.${entry.nom.toLowerCase()}@test.com`,
      motDePasse: passwordHash,
      role,
      abonnementLocataire: entry.abonnementLocataire ?? (role === "locataire" ? randomFromArray(["standard", "premium", "golden"]) : "aucun"),
      abonnementProprietaire: entry.abonnementProprietaire ?? (role === "proprietaire" ? randomFromArray(["standard", "premium", "golden"]) : "aucun"),
      dateDebutAbonnementLocataire: role === "locataire" ? dateDebut : null,
      dateFinAbonnementLocataire: role === "locataire" ? dateFin : null,
      dateDebutAbonnementProprietaire: role === "proprietaire" ? dateDebut : null,
      dateFinAbonnementProprietaire: role === "proprietaire" ? dateFin : null,
      verifie: role === "proprietaire",
      note: role === "proprietaire" ? randomBetween(3, 5) : undefined,
      nombreAvis: role === "proprietaire" ? randomBetween(1, 18) : undefined,
    });

    users.push(user);
  }

  const owners = users.filter((user) => user.role === "proprietaire");
  const clients = users.filter((user) => user.role === "locataire");

  const endDate = new Date();
  const startDate = addDays(endDate, -90);

  const listingDocs = [];
  for (let i = 0; i < 10; i += 1) {
    const owner = owners[i % owners.length];
    const createdAt = randomDateBetween(startDate, endDate);
    listingDocs.push(buildListingData(i, owner._id, createdAt));
  }

  for (let i = 0; i < 5; i += 1) {
    const owner = owners[i % owners.length];
    const createdAt = randomDateBetween(startDate, endDate);
    listingDocs.push(buildRejectedListingData(i + 10, owner._id, createdAt));
  }

  const listings = await Listing.insertMany(listingDocs);
  console.log(`Création de ${listings.length} annonces (dont 5 rejetées).`);

  const paymentDocs = [];
  users.forEach((user) => {
    const plans = [];
    if (user.role === "locataire" && user.abonnementLocataire !== "aucun") {
      plans.push({ type: "locataire", plan: user.abonnementLocataire });
    }
    if (user.role === "proprietaire" && user.abonnementProprietaire !== "aucun") {
      plans.push({ type: "proprietaire", plan: user.abonnementProprietaire });
    }

    plans.forEach((sub) => {
      let periodStart = randomDateBetween(startDate, addDays(startDate, 15));
      while (periodStart < endDate) {
        paymentDocs.push(buildPaymentData(user, sub.type, sub.plan, periodStart));
        periodStart = addDays(periodStart, 30);
      }
    });
  });

  await Payment.insertMany(paymentDocs);
  console.log(`Création de ${paymentDocs.length} paiements d'abonnement.`);

  const appointmentDocs = [];
  const activeListings = listings.filter((listing) => listing.statut !== "rejetee");

  for (let i = 0; i < 30; i += 1) {
    const client = randomFromArray(clients);
    const listing = randomFromArray(activeListings);
    const date = randomDateBetween(startDate, endDate);
    const statut = date > new Date() ? "en_attente" : randomFromArray(["terminee", "confirmee", "annulee"]);

    appointmentDocs.push({
      utilisateur: client._id,
      logement: listing._id,
      date,
      heure: randomFromArray(TIME_SLOTS),
      statut,
    });
  }
  await Appointment.insertMany(appointmentDocs);
  console.log(`Création de ${appointmentDocs.length} visites.`);

  const conversationDocs = [];
  for (let i = 0; i < 12; i += 1) {
    const [owner, client] = randomDistinctPair([...owners, ...clients].filter((user) => user.role !== "admin"));
    const listing = randomFromArray(activeListings);
    const startDateConv = randomDateBetween(startDate, endDate);
    conversationDocs.push(buildConversationData([owner._id, client._id], listing._id, startDateConv));
  }
  await Conversation.insertMany(conversationDocs);
  console.log(`Création de ${conversationDocs.length} conversations.`);

  const reportDocs = [];
  const reportMotifs = [
    "Annonce trompeuse",
    "Comportement suspect",
    "Prix incorrect",
    "Photos manquantes",
    "Logement déjà loué",
    "Description incomplète",
  ];

  for (let i = 0; i < 8; i += 1) {
    const client = randomFromArray(clients);
    const owner = randomFromArray(owners);
    const listing = randomFromArray(listings);
    reportDocs.push(buildReport(
      client._id,
      listing._id,
      owner._id,
      randomFromArray(reportMotifs),
      "Le signalement correspond à un problème constaté lors de mon parcours.",
      randomFromArray(["nouveau", "traite", "ignore"]),
      randomDateBetween(startDate, endDate),
    ));
  }
  await Report.insertMany(reportDocs);
  console.log(`Création de ${reportDocs.length} signalements.`);

  const notificationDocs = [];
  const notificationTemplates = [
    { type: "message", text: "Nouveau message reçu" },
    { type: "confirmation_visite", text: "Votre visite a été confirmée" },
    { type: "nouvelle_annonce", text: "Une nouvelle annonce correspond à votre recherche" },
    { type: "annonce_expiree", text: "Une annonce a expiré" },
    { type: "systeme", text: "Mise à jour du système" },
  ];

  for (let i = 0; i < 18; i += 1) {
    const user = randomFromArray(users);
    const listing = randomFromArray(listings);
    const template = randomFromArray(notificationTemplates);
    notificationDocs.push(buildNotification(
      user._id,
      template.type,
      `${template.text} : ${listing.titre}`,
      `/logement/${listing._id}`,
      randomDateBetween(startDate, endDate),
    ));
  }
  await Notification.insertMany(notificationDocs);
  console.log(`Création de ${notificationDocs.length} notifications.`);

  console.log("\n✅ Seed terminé avec succès !");
  console.log(`   Utilisateurs : ${users.length + 1} (admin inclus)`);
  console.log(`   Annonces actives : ${activeListings.length}`);
  console.log(`   Annonces rejetées : ${listings.length - activeListings.length}`);
  console.log(`   Paiements : ${paymentDocs.length}`);
  console.log(`   Visites : ${appointmentDocs.length}`);
  console.log(`   Conversations : ${conversationDocs.length}`);
  console.log(`   Signalements : ${reportDocs.length}`);
  console.log(`   Notifications : ${notificationDocs.length}\n`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error("Erreur lors du seed :", error);
  process.exit(1);
});
