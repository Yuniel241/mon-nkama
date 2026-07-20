import logoImg from "../assets/logo.png";

/*
  LOGO — emplacement du fichier image
  --------------------------------------------------------
  Le fichier logo se trouve à deux endroits (mets ton logo
  définitif dans CES DEUX fichiers si tu veux le remplacer) :

  1) client/src/assets/logo.png   -> utilisé ici, dans le code React
  2) client/public/logo/logo.png  -> utilisé comme favicon (voir index.html)

  Pour changer le logo : remplace simplement ces deux fichiers
  par ta nouvelle image (garde le même nom "logo.png"), aucune
  autre modification n'est nécessaire.
*/

const Logo = ({ size = 44, showText = true, light = false }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <img
      src={logoImg}
      alt="MON NKAMA"
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }}
    />
    {showText && (
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: size * 0.42,
          letterSpacing: "-0.02em",
          color: light ? "#fff" : "var(--nk-navy-900)",
        }}
      >
        MON NKAMA
      </span>
    )}
  </div>
);

export default Logo;
