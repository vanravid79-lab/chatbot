import {
  authorizeFaqWrite,
  jsonError,
  parseFaqId,
  readFaqBody,
  validateFaq,
} from "@/lib/faqApi";
import {
  deleteFaq,
  getFaqById,
  replaceFaq,
} from "@/lib/faqStore";

export const runtime = "nodejs";

async function getRouteFaqId(context) {
  const { id: idParam } = await context.params;
  return parseFaqId(idParam);
}

export async function GET(_request, context) {
  const id = await getRouteFaqId(context);

  if (id === null) {
    return jsonError("FAQ id must be a positive integer.", 400);
  }

  try {
    const data = await getFaqById(id);

    if (!data) {
      return jsonError(`FAQ with id ${id} was not found.`, 404);
    }

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Failed to load FAQ.", error);
    return jsonError("Unable to load FAQ.", 500);
  }
}

export async function PUT(request, context) {
  const authorizationError = authorizeFaqWrite(request);

  if (authorizationError) {
    return authorizationError;
  }

  const id = await getRouteFaqId(context);

  if (id === null) {
    return jsonError("FAQ id must be a positive integer.", 400);
  }

  const { body, error } = await readFaqBody(request);

  if (error) {
    return error;
  }

  const validation = validateFaq(body, {
    requireCategory: true,
    requireAnswers: true,
  });

  if (validation.error) {
    return jsonError(validation.error, 400);
  }

  try {
    const data = await replaceFaq(id, validation.faq);

    if (!data) {
      return jsonError(`FAQ with id ${id} was not found.`, 404);
    }

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Failed to update FAQ.", error);
    return jsonError("Unable to update FAQ.", 500);
  }
}

export async function DELETE(request, context) {
  const authorizationError = authorizeFaqWrite(request);

  if (authorizationError) {
    return authorizationError;
  }

  const id = await getRouteFaqId(context);

  if (id === null) {
    return jsonError("FAQ id must be a positive integer.", 400);
  }

  try {
    const data = await deleteFaq(id);

    if (!data) {
      return jsonError(`FAQ with id ${id} was not found.`, 404);
    }

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Failed to delete FAQ.", error);
    return jsonError("Unable to delete FAQ.", 500);
  }
}
