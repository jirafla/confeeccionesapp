import * as xlsx from "xlsx";

const filePath = "C:/Users/LENOVO/.gemini/antigravity/brain/6b327249-0d97-4804-a882-53bd32ded783/.user_uploaded/media_1790969247403.xlsx";
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const data = xlsx.utils.sheet_to_json(sheet) as any[];
if (data.length > 0) {
  console.log("Columnas de la primera fila:", Object.keys(data[0]));
  console.log("Primera fila:", data[0]);
}
