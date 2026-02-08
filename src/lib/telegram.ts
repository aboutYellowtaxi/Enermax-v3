const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`

export function isTelegramConfigured(): boolean {
  return !!(BOT_TOKEN && CHAT_ID)
}

// Create a forum topic (thread) in the Telegram group
// Returns the message_thread_id or null on failure
export async function createForumTopic(name: string): Promise<number | null> {
  if (!isTelegramConfigured()) return null

  try {
    const res = await fetch(`${API_BASE}/createForumTopic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        name: name.slice(0, 128), // Telegram limit
        icon_color: 0x6FB9F0, // blue
      }),
    })
    const data = await res.json()
    if (data.ok && data.result) {
      return data.result.message_thread_id
    }
    return null
  } catch {
    return null
  }
}

export async function sendTelegramMessage(
  text: string,
  options?: { topicId?: number; replyMarkup?: object }
): Promise<boolean> {
  if (!isTelegramConfigured()) return false

  try {
    const body: Record<string, unknown> = {
      chat_id: CHAT_ID,
      text,
      parse_mode: 'HTML',
    }
    if (options?.topicId) {
      body.message_thread_id = options.topicId
    }
    if (options?.replyMarkup) {
      body.reply_markup = options.replyMarkup
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

export async function sendTelegramPhoto(
  photoUrl: string,
  caption: string,
  topicId?: number
): Promise<boolean> {
  if (!isTelegramConfigured()) return false

  try {
    const body: Record<string, unknown> = {
      chat_id: CHAT_ID,
      photo: photoUrl,
      caption,
      parse_mode: 'HTML',
    }
    if (topicId) {
      body.message_thread_id = topicId
    }

    const res = await fetch(`${API_BASE}/sendPhoto`, {
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
