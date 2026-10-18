/**
 * Comprueba que schemas/businesses.json y schemas/documents.json rechacen lo que
 * tiene que faltar: los campos obligatorios de cada lado.
 *
 * Alcance deliberadamente chico. Antes cubría también los tipos, los patrones
 * hex, los enums y los rangos; se quitó a pedido porque el ruido tapaba lo que
 * importa. Lo que queda NO es una red contra datos malos: si mañana alguien
 * escribe "rojo" en un color, el schema lo va a rechazar pero nada acá lo va a
 * avisar. Para eso están `npm run verify` (que valida cada JSON de src/data
 * contra el schema de verdad) y el typecheck.
 *
 *   node scripts/verify-schemas.mjs
 */
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFileSync } from "node:fs";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const schemaDir = new URL("../schemas/", import.meta.url);
const readSchema = (name) => JSON.parse(readFileSync(new URL(schemaDir + name), "utf8"));

// documents.json referencia businesses.json#/$defs/stylesOverride.
ajv.addSchema(readSchema("businesses.json"), "businesses.json");

const validateDocument = ajv.compile(readSchema("documents.json"));
// businesses.json solo estaba REGISTRADO, para que el $ref de documents.json
// resuelva: nunca se compilaba como validator. Compilado aparte, no con el
// schema registrado, para que Ajv no lo deduplique.
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
const okBusiness = (label, shouldPass, doc) => check(label, shouldPass, validateBusiness, doc);

const base = {
  title: "Carta Principal",
  status: "published",
  pages: ["/business/mi-negocio/carta/01.webp"],
};

const businessBase = {
  name: "Lo de Pepe",
  template: "pastel-link-hub",
  socialLinks: [{ platform: "instagram", url: "https://instagram.com/lodopepe" }],
};

console.log("== document.json: obligatorios ==");
ok("completo", true, { ...base });
ok("sin title", false, { status: "published", pages: ["/business/mi-negocio/carta/01.webp"] });
ok("sin status", false, { title: "Carta", pages: ["/business/mi-negocio/carta/01.webp"] });
ok("sin pages", false, { title: "Carta", status: "published" });
ok("objeto vacío", false, {});

console.log("\n== business.json: obligatorios ==");
okBusiness("completo", true, { ...businessBase });
okBusiness("sin name", false, { ...businessBase, name: "" });
okBusiness("sin template", false, { name: "Lo de Pepe", socialLinks: [] });
okBusiness("sin socialLinks", false, { name: "Lo de Pepe", template: "pastel-link-hub" });
okBusiness("socialLink sin url", false, {
  ...businessBase,
  socialLinks: [{ platform: "instagram" }],
});

console.log(`\n== ${pass} OK / ${fail} FALLAS ==`);
process.exit(fail ? 1 : 0);
