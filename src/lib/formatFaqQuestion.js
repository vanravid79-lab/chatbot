export function formatFaqQuestion(question) {
  if (/^\s*\d+\s*[-.)]\s*/.test(question.question)) {
    return question.question;
  }

  return `${question.id} - ${question.question}`;
}
