import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { getExcelData } from "@/lib/excel";

const faqFilePath = path.join(process.cwd(), "data", "faqs.json");
let mutationQueue = Promise.resolve();

async function readFaqs() {
  try {
    const contents = await readFile(faqFilePath, "utf8");
    const questions = JSON.parse(contents);

    if (!Array.isArray(questions)) {
      throw new Error("FAQ data file must contain an array.");
    }

    return questions;
  } catch (error) {
    if (error.code === "ENOENT") {
      return getExcelData();
    }

    throw error;
  }
}

async function writeFaqs(questions) {
  const temporaryPath = `${faqFilePath}.${randomUUID()}.tmp`;
  const contents = `${JSON.stringify(questions, null, 2)}\n`;

  await mkdir(path.dirname(faqFilePath), { recursive: true });

  try {
    await writeFile(temporaryPath, contents, {
      encoding: "utf8",
      flag: "wx",
    });
    await rename(temporaryPath, faqFilePath);
  } catch (error) {
    try {
      await rm(temporaryPath, { force: true });
    } catch (cleanupError) {
      console.error("Failed to remove temporary FAQ data file.", cleanupError);
    }

    throw error;
  }
}

function serializeMutation(mutation) {
  const result = mutationQueue.then(mutation);
  mutationQueue = result.catch(() => {});
  return result;
}

export function listFaqs() {
  return mutationQueue.then(readFaqs);
}

export function getFaqById(id) {
  return mutationQueue.then(async () => {
    const questions = await readFaqs();
    return questions.find((question) => question.id === id) || null;
  });
}

export function createFaq(faq) {
  return serializeMutation(async () => {
    const questions = await readFaqs();
    const id = questions.reduce(
      (highestId, question) => Math.max(highestId, Number(question.id) || 0),
      0,
    ) + 1;
    const createdFaq = { id, ...faq };

    await writeFaqs([...questions, createdFaq]);

    return createdFaq;
  });
}

export function replaceFaq(id, faq) {
  return serializeMutation(async () => {
    const questions = await readFaqs();
    const index = questions.findIndex((question) => question.id === id);

    if (index === -1) {
      return null;
    }

    const updatedFaq = { id, ...faq };
    questions[index] = updatedFaq;
    await writeFaqs(questions);

    return updatedFaq;
  });
}

export function deleteFaq(id) {
  return serializeMutation(async () => {
    const questions = await readFaqs();
    const deletedFaq = questions.find((question) => question.id === id);

    if (!deletedFaq) {
      return null;
    }

    await writeFaqs(questions.filter((question) => question.id !== id));

    return deletedFaq;
  });
}
