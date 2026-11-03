import { createFaq, listFaqs } from "@/lib/faqStore";
import {
  authorizeFaqWrite,
  jsonError,
  readFaqBody,
  validateFaq,
} from "@/lib/faqApi";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await listFaqs();

    return Response.json({
      success: true,
      totalQuestions: data.length,
      data,
    });
  } catch (error) {
    console.error("Failed to load FAQ data.", error);
    return jsonError("Unable to load FAQ data.", 500);
  }
}

export async function POST(request) {
  const authorizationError = authorizeFaqWrite(request);

  if (authorizationError) {
    return authorizationError;
  }

  const { body, error } = await readFaqBody(request);

  if (error) {
    return error;
  }

  const validation = validateFaq(body);

  if (validation.error) {
    return jsonError(validation.error, 400);
  }

  try {
    const data = await createFaq(validation.faq);
    return Response.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Failed to create FAQ.", error);
    return jsonError("Unable to create FAQ.", 500);
  }
}
