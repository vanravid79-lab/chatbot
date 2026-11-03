import { createHmac, timingSafeEqual } from "node:crypto";
import { processMessengerEvents } from "@/services/messengerService";

export const runtime = "nodejs";

function secureEqual(value, expected) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  return (
    valueBuffer.length === expectedBuffer.length &&
    timingSafeEqual(valueBuffer, expectedBuffer)
  );
}

function isValidSignature(rawBody, signature, appSecret) {
  const match = signature.match(/^sha256=([a-f\d]{64})$/i);

  if (!match) {
    return false;
  }

  const expectedSignature = createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");

  return secureEqual(match[1].toLowerCase(), expectedSignature);
}

export async function GET(request) {
  const verifyToken = process.env.META_VERIFY_TOKEN;

  if (!verifyToken) {
    return new Response("Messenger webhook is not configured.", {
      status: 503,
    });
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const receivedToken = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode !== "subscribe" ||
    !receivedToken ||
    !secureEqual(receivedToken, verifyToken) ||
    !challenge
  ) {
    return new Response("Webhook verification failed.", { status: 403 });
  }

  return new Response(challenge);
}

export async function POST(request) {
  const appSecret = process.env.META_APP_SECRET;

  if (!appSecret) {
    return new Response("Messenger webhook is not configured.", {
      status: 503,
    });
  }

  const rawBody = Buffer.from(await request.arrayBuffer());
  const signature = request.headers.get("x-hub-signature-256") || "";

  if (!isValidSignature(rawBody, signature, appSecret)) {
    return new Response("Invalid webhook signature.", { status: 401 });
  }

  let payload;

  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return new Response("Invalid JSON payload.", { status: 400 });
  }

  if (payload.object !== "page" || !Array.isArray(payload.entry)) {
    return new Response("Unsupported webhook event.", { status: 404 });
  }

  try {
    await processMessengerEvents(payload.entry);
  } catch (error) {
    console.error(
      "Messenger webhook processing failed.",
      error instanceof Error ? error.message : "Unknown error.",
    );
    return new Response("Webhook processing failed.", { status: 500 });
  }

  return new Response("EVENT_RECEIVED");
}
