import { PrismaClient } from "@prisma/client";
import * as xlsx from "xlsx";

const prisma = new PrismaClient();

async function main() {
  const filePath = "C:/Users/LENOVO/.gemini/antigravity/brain/6b327249-0d97-4804-a882-53bd32ded783/.user_uploaded/media_1790969247403.xlsx";
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  const data = xlsx.utils.sheet_to_json(sheet) as any[];

  console.log(`Leídas ${data.length} filas del Excel.`);

  // 1. Create a dummy Empresa for this user
  const empresa = await prisma.empresa.create({
    data: {
      nombre: "Confecciones Sunset",
    }
  });

  console.log(`Creada Empresa: ${empresa.nombre} con ID: ${empresa.id}`);

  let insertados = 0;

  for (const row of data) {
    const nombre = row["Cliente"];
    if (!nombre) continue;

    const telefonoStr = ""; // There is no phone column based on the output
    const direccionStr = row["Dirección"] || row["Direccion"] || "";

    await prisma.taller.create({
      data: {
        nombre: nombre.toString().trim(),
        telefono: telefonoStr.toString().trim(),
        direccion: direccionStr.toString().trim(),
        empresaId: empresa.id
      }
    });
    insertados++;
  }

  console.log(`✅ ¡Éxito! Se importaron ${insertados} talleres a la empresa ${empresa.nombre}.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
