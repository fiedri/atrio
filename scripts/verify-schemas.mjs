/**
 * Comprueba que schemas/businesses.json y schemas/documents.json rechacen lo que
 * debe rechazar y acepten lo que debe aceptar. Un schema que no falla nunca no
 * sirve de nada.
 *
 *   node scripts/verify-schemas.mjs
 */
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFileSync } from "node:fs";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const schemaDir = new URL("../schemas/", import.meta.url);
const readSchema = (name) => JSON.parse(readFileSync(new URL(name, schemaDir), "utf8"));

// documents.json referencia businesses.json#/$defs/stylesOverride.
ajv.addSchema(readSchema("businesses.json"), "businesses.json");

const validateDocument = ajv.compile(readSchema("documents.json"));
// businesses.json hasta ahora solo estaba REGISTRADO, para que el $ref de
// documents.json resuelva: nunca se compilaba como validator. Por eso el
// `template` del business — que es el que decide qué página se dibuja — no lo
// testeaba nadie. Compilado aparte, no con el schema registrado, para que Ajv
// no lo deduplique.
const validateBusiness = ajv.compile({
  ...readSchema("businesses.json"),
  $id: "businesses-standalone.json",
});

let pass = 0;
let fail = 0;

const check = (label, shouldPass, validate, doc) => {
  const valid = validate(doc);
  const good = valid === shouldPass;
  if (good) pass++;
  else fail++;
  if (good) console.log(`  OK   ${label}`);
  else {
    console.log(`  FALLA ${label} (esperaba ${shouldPass ? "válido" : "inválido"})`);
    for (const e of validate.errors ?? []) {
      console.log(`         ${e.instancePath || "/"} ${e.message}`);
    }
  }
};

const ok = (label, shouldPass, doc) => check(label, shouldPass, validateDocument, doc);

const base = {
  title: "Carta Principal",
  status: "published",
  pages: ["./pages/01.webp", "./pages/02.webp"],
};

console.log("== Documento mínimo válido ==");
ok("sin styles ni description", true, { ...base });
ok("styles vacío", true, { ...base, styles: {} });

console.log("\n== styles parcial (el caso normal) ==");
ok("sin styles: hereda todo", true, { ...base });
ok("styles vacio", true, { ...base, styles: {} });
ok("solo un color", true, { ...base, styles: { colors: { accent: "#c8963e" } } });
ok("una sola seccion de colors (override parcial)", true, {
  ...base,
  styles: { colors: { accent: "#c8963e" } },
});
ok("colors completo", true, {
  ...base,
  styles: {
    colors: {
      background: "#000",
      surface: "#111",
      text: "#fff",
      textMuted: "#999",
      accent: "#d4a056",
      border: "#222",
    },
  },
});
ok("solo background.image", true, { ...base, styles: { background: { image: "./bg.webp" } } });
ok("hex corto", true, { ...base, styles: { colors: { accent: "#fff" } } });
ok("spacing completo", true, { ...base, styles: { spacing: { gap: 8, padding: 16, radius: 0 } } });

console.log("\n== template ==");
ok("template editorial", true, { ...base, template: "editorial" });
ok("template gallery", true, { ...base, template: "gallery" });
ok("template pastel-link-hub", true, { ...base, template: "pastel-link-hub" });
ok("template inventado", false, { ...base, template: "neon" });
ok("theme (nombre viejo)", false, { ...base, theme: "dark" });

console.log("\n== badge del menú: icon y background ==");
ok("icon válido", true, { ...base, icon: "mdi:glass-cocktail" });
ok("icon de otra colección", true, { ...base, icon: "akar-icons:wine-glass" });
ok("background hex largo", true, { ...base, background: "#E7B54A" });
ok("background hex corto", true, { ...base, background: "#fff" });
ok("sin icon ni background (ciclo por posición)", true, { ...base });
ok("icon string vacío", false, { ...base, icon: "" });
ok("icon no-string", false, { ...base, icon: 42 });
ok("background no-hex", false, { ...base, background: "mostaza" });
ok("background sin #", false, { ...base, background: "E7B54A" });
ok("background con 7 dígitos", false, { ...base, background: "#E7B54AA" });

console.log("\n== orden de los menús ==");
ok("order entero", true, { ...base, order: 1 });
ok("order 0", true, { ...base, order: 0 });
ok("order alto", true, { ...base, order: 99 });
ok("sin order (alphabetico)", true, { ...base });
ok("order decimal", false, { ...base, order: 1.5 });
ok("order negativo", false, { ...base, order: -1 });
ok("order string", false, { ...base, order: "primero" });

console.log("\n== styles inválido ==");
ok("color no-hex", false, { ...base, styles: { colors: { accent: "rojo" } } });
ok("hex sin #", false, { ...base, styles: { colors: { accent: "c8963e" } } });
ok("scale fuera de rango", false, { ...base, styles: { typography: { scale: 99 } } });
ok("headingWeight no entero", false, { ...base, styles: { typography: { headingWeight: 600.5 } } });
ok("gap no entero", false, { ...base, styles: { spacing: { gap: 1.5 } } });
ok("gap negativo", false, { ...base, styles: { spacing: { gap: -4 } } });
ok("clave desconocida en colors", false, { ...base, styles: { colors: { colorBg: "#fff" } } });
ok("clave desconocida en styles", false, { ...base, styles: { colores: {} } });
ok("color sin string", false, { ...base, styles: { colors: { accent: 123 } } });

console.log("\n== video requiere poster ==");
ok("video con poster", true, {
  ...base,
  styles: { background: { video: "./bg.mp4", videoPoster: "./p.webp" } },
});
ok("video sin poster", false, { ...base, styles: { background: { video: "./bg.mp4" } } });
ok("poster sin video", false, {
  ...base,
  styles: { background: { videoPoster: "./p.webp" } },
});

console.log("\n== Campos obligatorios ==");
ok("sin title", false, { status: "published", pages: ["./pages/01.webp"] });
ok("sin status", false, { title: "Carta", pages: ["./pages/01.webp"] });
ok("sin pages", false, { title: "Carta", status: "published" });
ok("objeto vacío", false, {});

console.log("\n== status y pages ==");
ok("status inválido", false, { ...base, status: "public" });
ok("archived", true, { ...base, status: "archived" });
ok("página sin pad de 2 dígitos", false, { ...base, pages: ["./pages/1.webp"] });
ok("página fuera de ./pages", false, { ...base, pages: ["/imagenes/01.webp"] });
ok("página .png en vez de .webp", false, { ...base, pages: ["./pages/01.png"] });
ok("muchas páginas", true, {
  ...base,
  pages: Array.from({ length: 14 }, (_, i) => `./pages/${String(i + 1).padStart(2, "0")}.webp`),
});

console.log("\n== typos (el motivo de additionalProperties:false) ==");
ok("titulo en vez de title", false, { ...base, titulo: "Carta" });
ok("stilos en vez de styles", false, { ...base, stilos: {} });
ok("theme (campo muerto)", false, { ...base, theme: "dark" });

/* ---------------------------------------------------------------------------
 * businesses.json, que hasta ahora solo se usaba para resolver un $ref.
 * El `template` del negocio es el que decide qué vista se dibuja: si el enum
 * se desincroniza del union TypeScript, el error aparece en build y no acá.
 * ------------------------------------------------------------------------ */
const businessBase = {
  name: "Lo de Pepe",
  template: "pastel-link-hub",
  socialLinks: [{ platform: "instagram", url: "https://instagram.com/lodopepe" }],
};

const okBusiness = (label, shouldPass, doc) => check(label, shouldPass, validateBusiness, doc);

console.log("\n== business mínimo válido ==");
okBusiness("sin styles", true, { ...businessBase });
okBusiness("styles vacío", true, { ...businessBase, styles: {} });
okBusiness("template pastel-link-hub", true, { ...businessBase, template: "pastel-link-hub" });
okBusiness("template editorial (stub, válido para el schema)", true, {
  ...businessBase,
  template: "editorial",
});
okBusiness("template grid", true, { ...businessBase, template: "grid" });

console.log("\n== showProfile ==");
okBusiness("showProfile true", true, { ...businessBase, showProfile: true });
okBusiness("showProfile false", true, { ...businessBase, showProfile: false });
okBusiness("sin showProfile (default true)", true, { ...businessBase });
okBusiness("showProfile como string", false, { ...businessBase, showProfile: "false" });
okBusiness("showProfile como número", false, { ...businessBase, showProfile: 0 });

console.log("\n== platform email en el ribbon ==");
okBusiness("socialLinks platform email", true, {
  ...businessBase,
  socialLinks: [{ platform: "email", url: "mailto:hola@lodopepe.ar" }],
});
okBusiness("platform email con icon y background", true, {
  ...businessBase,
  socialLinks: [
    {
      platform: "email",
      url: "mailto:hola@lodopepe.ar",
      icon: "carbon:email",
      background: "#D44638",
    },
  ],
});
okBusiness("platform inventado", false, {
  ...businessBase,
  socialLinks: [{ platform: "telegram", url: "https://t.me/x" }],
});
okBusiness("socialLink sin url", false, {
  ...businessBase,
  socialLinks: [{ platform: "email" }],
});
okBusiness("template gallery", true, { ...businessBase, template: "gallery" });

console.log("\n== business template inválido ==");
okBusiness("template inventado", false, { ...businessBase, template: "neon" });
okBusiness("template con mayúscula", false, { ...businessBase, template: "Pastel-Link-Hub" });
okBusiness("sin template", false, {
  name: "Lo de Pepe",
  socialLinks: [],
});
okBusiness("template null", false, { ...businessBase, template: null });

console.log("\n== business obligatorios ==");
okBusiness("sin name", false, { ...businessBase, name: "" });
okBusiness("sin socialLinks", false, { name: "Lo de Pepe", template: "pastel-link-hub" });
okBusiness("socialLinks vacío es válido", true, {
  ...businessBase,
  socialLinks: [],
});
okBusiness("socialLink sin url", false, {
  ...businessBase,
  socialLinks: [{ platform: "instagram" }],
});
okBusiness("socialLink con plataforma inventada", false, {
  ...businessBase,
  socialLinks: [{ platform: "myspace", url: "https://x.com" }],
});
okBusiness("styles con color no-hex", false, {
  ...businessBase,
  styles: { colors: { accent: "rojo" } },
});

/* `icon` y `background` son campos de un socialLink, o sea de business.json, no
   de documents.json: van por okBusiness y no por ok. El $ref a hexColor los
   mete en el MISMO patrón que los colores del tema, así que "rojo" y "E1306C"
   sin # tienen que caer en vez de colarse. */
console.log("\n== business socialLinks: icon y background ==");
const social = (extra) => ({
  ...businessBase,
  socialLinks: [{ platform: "instagram", url: "https://instagram.com/lodopepe", ...extra }],
});

okBusiness("icon válido (sintaxis Iconify)", true, social({ icon: "akar-icons:instagram-fill" }));
okBusiness("background hex de 6 dígitos", true, social({ background: "#E1306C" }));
okBusiness("background hex de 3 dígitos", true, social({ background: "#fff" }));
okBusiness("sin icon ni background (ambos opcionales)", true, social({}));
okBusiness("background no-hex", false, social({ background: "rojo" }));
okBusiness("background hex sin #", false, social({ background: "E1306C" }));
okBusiness("icon no-string", false, social({ icon: 123 }));

console.log(`\n== ${pass} OK / ${fail} FALLAS ==`);
process.exit(fail ? 1 : 0);
