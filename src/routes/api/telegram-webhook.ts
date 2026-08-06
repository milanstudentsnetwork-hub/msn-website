import { createFileRoute } from "@tanstack/react-router";
import {
  sendTelegramMessage,
  formatAccommodationReply,
  formatEventsReply,
  formatServicesReply,
  WELCOME_TEXT,
} from "@/lib/telegram.server";

type TelegramUpdate = {
  message?: {
    chat?: { id?: number };
    text?: string;
  };
};

async function handleUpdate(update: TelegramUpdate) {
  const chatId = update.message?.chat?.id;
  const text = update.message?.text;
  if (!chatId || !text) return;

  const command = text.trim().split(/\s+/)[0]?.toLowerCase();

  let reply: string;
  switch (command) {
    case "/start":
    case "/help":
      reply = WELCOME_TEXT;
      break;
    case "/accommodation":
      reply = await formatAccommodationReply();
      break;
    case "/events":
      reply = await formatEventsReply();
      break;
    case "/services":
      reply = await formatServicesReply();
      break;
    default:
      reply = "Not sure what you mean — try /accommodation, /events, or /services.";
  }

  await sendTelegramMessage(chatId, reply);
}

export const Route = createFileRoute("/api/telegram-webhook")({
  server: {
    handlers: {
      GET: async () => new Response("Telegram webhook is alive.", { status: 200 }),
      POST: async ({ request }: { request: Request }) => {
        try {
          const update = (await request.json()) as TelegramUpdate;
          await handleUpdate(update);
        } catch (err) {
          console.error("[telegram-webhook] failed to handle update", err);
        }
        // Always 200 — Telegram retries aggressively on non-2xx responses.
        return new Response("OK", { status: 200 });
      },
    },
  },
});
