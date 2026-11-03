import { getExcelData } from "@/lib/excel";
import { findFaqMatch } from "@/lib/faqSearch";

const NO_MATCH_REPLY =
  "Hi! I’m RC Labs Cambodia’s automated assistant. I can help with questions about our brand, products, ingredients, and availability. Please try rephrasing your question.";

function splitMessage(text, maxLength = 1800) {
  const parts = [];
  let remaining = text;

  while (remaining.length > maxLength) {
    let splitAt = remaining.lastIndexOf(" ", maxLength);

    if (splitAt < maxLength / 2) {
      splitAt = maxLength;
    }

    parts.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining) {
    parts.push(remaining);
  }

  return parts;
}

async function sendMessage(recipientId, text) {
  const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
  const graphApiVersion = process.env.META_GRAPH_API_VERSION;

  if (!pageAccessToken || !/^v\d+\.\d+$/.test(graphApiVersion || "")) {
    throw new Error("Messenger Page access token or Graph API version is missing.");
  }

  const endpoint = new URL(
    `https://graph.facebook.com/${graphApiVersion}/me/messages`,
  );
  endpoint.searchParams.set("access_token", pageAccessToken);

  for (const messageText of splitMessage(text)) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_type: "RESPONSE",
        recipient: { id: recipientId },
        message: { text: messageText },
      }),
      signal: AbortSignal.timeout(3500),
    });

    if (!response.ok) {
      console.error("Messenger Send API request failed.", response.status);
      throw new Error("Messenger could not send the reply.");
    }
  }
}

async function replyToMessage(event) {
  const message = event.message;
  const senderId = event.sender?.id;

  if (
    !senderId ||
    typeof message?.text !== "string" ||
    message.is_echo
  ) {
    return;
  }

  const questions = getExcelData();
  const matchedQuestion = findFaqMatch(message.text, questions);
  const answer = matchedQuestion
    ? [matchedQuestion.answerEnglish, matchedQuestion.answerKhmer]
        .filter(Boolean)
        .join("\n\n")
    : NO_MATCH_REPLY;

  await sendMessage(
    senderId,
    answer || "Sorry, no answer is available for that question.",
  );
}

export async function processMessengerEvents(entries) {
  const events = entries.flatMap((entry) =>
    Array.isArray(entry?.messaging) ? entry.messaging : [],
  );

  await Promise.all(events.map(replyToMessage));
}
