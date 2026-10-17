import fs from 'fs';
import path from 'path';
import { pdf } from 'pdf-to-img';
import sharp from 'sharp';

async function main() {
  const rawInputPath = process.argv[2];

  if (!rawInputPath) {
    console.error('❌ Por favor, arrastra o proporciona la ruta del archivo PDF.');
    process.exit(1);
  }

  const pdfPath = path.resolve(rawInputPath.replace(/^['"](.*)['"]\$/, '\$1'));

  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ El archivo no existe en la ruta: ${pdfPath}`);
    process.exit(1);
  }

  const originalName = path.basename(pdfPath, path.extname(pdfPath))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_');

  const publicDir = path.resolve('public');
  let folderName = originalName;
  let targetDir = path.join(publicDir, folderName);

  if (fs.existsSync(targetDir)) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    folderName = `${originalName}_${randomSuffix}`;
    targetDir = path.join(publicDir, folderName);
  }

  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`📂 Carpeta creada/asignada: public/${folderName}`);

  try {
    console.log('🔄 Convirtiendo PDF a imágenes (alta resolución)...');
    
    // Usamos 'pdf' con la escala de alta resolución
    const document = await pdf(pdfPath, {
      scale: 2.5
    });

    let pageCounter = 1;

    for await (const imageBuffer of document) {
      const pageName = String(pageCounter).padStart(2, '0') + '.webp';
      const outputPath = path.join(targetDir, pageName);

      await sharp(imageBuffer)
        .webp({ 
          quality: 85,
          effort: 6
        })
        .toFile(outputPath);

      console.log(`✔️ Página ${pageCounter} guardada como ${pageName}`);
      pageCounter++;
    }

    console.log(`\n🎉 ¡Proceso completado con éxito! Las imágenes están en: public/${folderName}/`);
  } catch (error) {
    console.error('❌ Ocurrió un error procesando el PDF:', error);
    process.exit(1);
  }
}

main();
