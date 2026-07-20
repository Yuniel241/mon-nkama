import { connectDB } from './config/db.js';
import Listing from './models/Listing.js';
import User from './models/User.js';

async function main() {
  await connectDB();
  const l = await Listing.findOne().lean();
  console.log('listingId=', l?._id?.toString());
  console.log('photos=', l?.photos ? JSON.stringify(l.photos.slice(0, 12), null, 2) : l?.photos);
  const u = await User.findOne({ role: 'locataire' }).lean();
  console.log('locataire=', JSON.stringify({ email: u?.email, abonnementLocataire: u?.abonnementLocataire, dateFinAbonnementLocataire: u?.dateFinAbonnementLocataire, abonnementProprietaire: u?.abonnementProprietaire, dateFinAbonnementProprietaire: u?.dateFinAbonnementProprietaire }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
