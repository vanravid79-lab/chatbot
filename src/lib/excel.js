
import * as XLSX from "xlsx";
import fs from "node:fs";
import path from "node:path";

export function getExcelData() {
  const filePath = path.join(process.cwd(), "data", "RC_Labs.xlsx");
  const fileBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const worksheet = workbook.Sheets["RC LABS"];

  if (!worksheet) {
    throw new Error("RC LABS sheet not found.");
  }

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });
  const questions = [];
  let currentCategory = "";

  for (const row of rows.slice(1)) {
    const category = String(row[0] || "").trim();
    const question = String(row[1] || "").trim();

    if (category) {
      currentCategory = category;
    }

    if (!/^\d+\s*[-–]/.test(question)) {
      continue;
    }

    questions.push({
      id: questions.length + 1,
      category: currentCategory,
      question: question.replace(/\s*\*{2,}[\s\S]*$/, "").trim(),
      answerEnglish: String(row[2] || "").trim(),
      answerKhmer: String(row[3] || "").trim(),
    });
  }

  return questions;
}