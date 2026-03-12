/**
 * Lightweight Telegram Bot API wrapper.
 * Uses native fetch — no dependencies.
 *
 * Env vars:
 *   TELEGRAM_BOT_TOKEN  — from @BotFather
 *   TELEGRAM_CHAT_ID    — Jarrad's chat ID
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? "";

export function isTelegramConfigured(): boolean {
  return Boolean(BOT_TOKEN && CHAT_ID);
}

export interface TelegramResult {
  ok: boolean;
  messageId?: number;
  error?: string;
}

/**
 * Send a Markdown-formatted message via Telegram Bot API.
 * Returns { ok, messageId } on success, { ok: false, error } on failure.
 */
export async function sendTelegram(
  text: string,
  opts?: { chatId?: string; silent?: boolean },
): Promise<TelegramResult> {
  const token = BOT_TOKEN;
  const chatId = opts?.chatId ?? CHAT_ID;

  if (!token || !chatId) {
    return { ok: false, error: "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set" };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        disable_notification: opts?.silent ?? false,
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      return { ok: false, error: data.description ?? "Telegram API error" };
    }

    return { ok: true, messageId: data.result?.message_id };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
