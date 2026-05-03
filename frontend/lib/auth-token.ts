const STORAGE_KEY = 'space-chess-access'

export function persistAccessToken(token: string | null): void {
  if (typeof window === 'undefined') return
  try {
    if (token) sessionStorage.setItem(STORAGE_KEY, token)
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // storage may be unavailable in private mode — ignore
  }
}

export function readAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function authHeaders(): Record<string, string> {
  const token = readAccessToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}
