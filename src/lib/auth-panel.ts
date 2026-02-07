import { NextRequest } from 'next/server'

const PANEL_SECRET = process.env.PANEL_SECRET

export function validatePanelAuth(request: NextRequest): boolean {
  if (!PANEL_SECRET) return false

  const authHeader = request.headers.get('x-panel-secret')
  return authHeader === PANEL_SECRET
}
