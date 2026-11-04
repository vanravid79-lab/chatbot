import { timingSafeEqual } from "node:crypto";

export function jsonError(message, status) {
  return Response.json({ success: false, error: message }, { status });
}

export function authorizeFaqWrite(request) {
  if (process.env.NODE_ENV === "development") {
    return null;
  }

  const expectedToken = process.env.FAQ_ADMIN_TOKEN;

  if (!expectedToken) {
    return jsonError("FAQ write access is not configured.", 503);
  }

  const authorization = request.headers.get("authorization") || "";
  const receivedToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  const expected = Buffer.from(expectedToken);
  const received = Buffer.from(receivedToken);
  const isValid =
    receivedToken.length > 0 &&
    expected.length === received.length &&
    timingSafeEqual(expected, received);

  return isValid ? null : jsonError("A valid admin bearer token is required.", 401);
}

export async function readFaqBody(request) {
  try {
    return { body: await request.json() };
  } catch {
    return { error: jsonError("Request body must be valid JSON.", 400) };
  }
}

export function validateFaq(
  body,
  { requireCategory = false, requireAnswers = false } = {},
) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be a JSON object." };
  }

  if (typeof body.question !== "string" || !body.question.trim()) {
    return { error: "question must be a non-empty string." };
  }

  if (
    requireCategory &&
    (typeof body.category !== "string" || !body.category.trim())
  ) {
    return { error: "category must be a non-empty string." };
  }

  for (const field of ["category", "answerEnglish", "answerKhmer"]) {
    if (body[field] !== undefined && typeof body[field] !== "string") {
      return { error: `${field} must be a string.` };
    }

    if (requireAnswers && typeof body[field] !== "string") {
      return { error: `${field} must be a string.` };
    }
  }

  return {
    faq: {
      category: body.category?.trim() || "General",
      question: body.question.trim(),
      answerEnglish: body.answerEnglish?.trim() || "",
      answerKhmer: body.answerKhmer?.trim() || "",
    },
  };
}

export function parseFaqId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}
