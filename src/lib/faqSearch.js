const stopWords = new Set([
  "a",
  "about",
  "and",
  "are",
  "can",
  "do",
  "does",
  "for",
  "from",
  "how",
  "i",
  "is",
  "it",
  "me",
  "of",
  "please",
  "the",
  "to",
  "what",
  "when",
  "where",
  "which",
  "who",
  "with",
]);

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/^\s*\d+\s*[-–.)]\s*/, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function getTokens(value) {
  return normalizeText(value)
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

function calculateSimilarity(queryTokens, questionTokens) {
  const overlap = [...queryTokens].filter((token) =>
    questionTokens.has(token),
  ).length;
  const precision = overlap / queryTokens.size;
  const recall = overlap / questionTokens.size;

  if (precision + recall === 0) {
    return 0;
  }

  return (2 * precision * recall) / (precision + recall);
}

export function findFaqMatch(text, questions) {
  const normalizedText = normalizeText(text);
  const queryTokens = new Set(getTokens(text));

  if (!normalizedText || queryTokens.size === 0) {
    return null;
  }

  const rankedQuestions = questions
    .map((item) => {
      const question = normalizeText(item.question);
      const score =
        normalizedText === question
          ? 1
          : calculateSimilarity(queryTokens, new Set(getTokens(item.question)));

      return { item, score };
    })
    .sort((left, right) => right.score - left.score);

  const [bestMatch, secondBestMatch] = rankedQuestions;

  if (
    !bestMatch ||
    bestMatch.score < 0.6 ||
    (secondBestMatch && bestMatch.score - secondBestMatch.score < 0.1)
  ) {
    return null;
  }

  return bestMatch.item;
}
