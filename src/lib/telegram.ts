const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`

export function isTelegramConfigured(): boolean {
  return !!(BOT_TOKEN && CHAT_ID)
}

export async function sendTelegramMessage(text: string, replyMarkup?: object): Promise<boolean> {
  if (!isTelegramConfigured()) return false

  try {
    const body: Record<string, unknown> = {
      chat_id: CHAT_ID,
      text,
      parse_mode: 'HTML',
    }
    if (replyMarkup) {
      body.reply_markup = replyMarkup
    }

    const res = await fetch(`${API_BASE}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return data.ok === true
  } catch {
    return false
  }
}

export async function sendTelegramPhoto(photoUrl: string, caption: string): Promise<boolean> {
  if (!isTelegramConfigured()) return false

  try {
    const res = await fetch(`${API_BASE}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        photo: photoUrl,
        caption,
        parse_mode: 'HTML',
      }),
    })
    const data = await res.json()
    return data.ok === true
  } catch {
    return false
  }
}
