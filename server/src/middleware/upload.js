import multer from "multer";
import path from "path";
import fs from "fs";

const makeStorage = (subfolder) => {
  const dir = path.join(process.cwd(), "src", "uploads", subfolder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  });
};

export const uploadListingPhotos = multer({ storage: makeStorage("listings") });
export const uploadProfilePhoto = multer({ storage: makeStorage("profiles") });
