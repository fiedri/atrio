/**
 * Valida cada JSON de public/data contra los schemas, y ademas comprueba que
 * las rutas de pages apunten a archivos que existen de verdad. Un schema puede
 * ser correcto y el referenciar un archivo que no está.
 *
 *   node scripts/verify-data.mjs
 */
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const MENUS = join(here, "..", "public", "data");

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const schemaPath = (name) => join(here, "..", "schemas", name);
const loadSchema = (name) => JSON.parse(readFileSync(schemaPath(name), "utf8"));

// documents.json referencia businesses.json#/$defs/stylesOverride. Ajv necesita
// ambos registrados con el $id correcto para resolver el $ref cruzado.
const businessSchema = loadSchema("businesses.json");
ajv.addSchema(businessSchema, "businesses.json");

const validateBusiness = ajv.compile(businessSchema);
const validateDocument = ajv.compile(loadSchema("documents.json"));

let pass = 0;
let fail = 0;

/** El formateo lo manda prettier, no nosotros: delegamos. */
function chkPrettier(file) {
  let okFormat = true;
  try {
    execFileSync("npx", ["prettier", "--check", file], { stdio: "pipe" });
  } catch {
    okFormat = false;
  }
  chk(`${file.split("/").slice(-2).join("/")} formateado`, okFormat, "npx prettier --write");
}
const chk = (label, ok, detail = "") => {
  if (ok) pass++;
  else fail++;
  console.log(`  ${ok ? "OK   " : "FALLA"} ${label}${ok ? "" : `\n         ${detail}`}`);
};

const businesses = readdirSync(MENUS).filter(
  (d) => existsSync(join(MENUS, d, "business.json")),
);

console.log(`== ${businesses.length} negocio(s) ==\n`);

for (const slug of businesses) {
  const bdir = join(MENUS, slug);
  console.log(`${slug}/`);

  const bRaw = readFileSync(join(bdir, "business.json"), "utf8");
  const business = JSON.parse(bRaw);
  chk(
    "business.json valida",
    validateBusiness(business),
    (validateBusiness.errors ?? []).map((e) => `${e.instancePath} ${e.message}`).join("; "),
  );
  chkPrettier(join(bdir, "business.json"));

  const logo = business.logo;
  if (logo) {
    // Un logo con slash inicial ("/favicon.ico") es una ruta desde la raíz del
    // sitio, no relativa al business.json. path.resolve() trata "/favicon.ico"
    // como absoluta y descarta el directorio base, así que terminaba stat-eando
    // la raíz del filesystem y daba FALLA sobre un archivo que sí existe.
    // Hay que decidir explícitamente contra qué se resuelve cada forma.
    const logoPath = logo.startsWith("/")
      ? join(here, "..", "public", logo)
      : resolve(bdir, logo);
    chk(
      `logo existe (${logo})`,
      existsSync(logoPath),
      `buscado en ${logoPath}, no existe`,
    );
  }

  const docs = readdirSync(bdir).filter((d) =>
    existsSync(join(bdir, d, "document.json")),
  );
  chk("tiene al menos un menú", docs.length > 0);

  for (const dslug of docs) {
    const ddir = join(bdir, dslug);
    const dRaw = readFileSync(join(ddir, "document.json"), "utf8");
    const doc = JSON.parse(dRaw);
    console.log(`  ${dslug}/`);
    chk(
      "document.json valida",
      validateDocument(doc),
      (validateDocument.errors ?? []).map((e) => `${e.instancePath} ${e.message}`).join("; "),
    );
    chkPrettier(join(ddir, "document.json"));

    let missing = [];
    for (const p of doc.pages ?? []) {
      const abs = resolve(ddir, p);
      if (!existsSync(abs)) missing.push(p);
      else if (!abs.endsWith(".webp")) missing.push(`${p} (no es .webp)`);
    }
    chk(`las ${doc.pages?.length ?? 0} páginas existen`, missing.length === 0, `faltan: ${missing.join(", ")}`);

    const onDisk = existsSync(join(ddir, "pages"))
      ? readdirSync(join(ddir, "pages")).filter((f) => f.endsWith(".webp")).length
      : 0;
    chk(
      `el JSON declara ${doc.pages?.length ?? 0} y hay ${onDisk} en disco`,
      onDisk === (doc.pages?.length ?? 0),
      "hay archivos huérfanos o faltantes",
    );

    if (doc.styles?.background?.video) {
      chk("video tiene poster", Boolean(doc.styles.background.videoPoster));
    }
    console.log(`      status=${doc.status}  páginas=${doc.pages?.length}  styles=${doc.styles ? "sí" : "defaults"}`);
  }
}

console.log(`\n== ${pass} OK / ${fail} FALLAS ==`);
process.exit(fail ? 1 : 0);
