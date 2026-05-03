/** Base URL для вызова API из браузера. Пустое значение = относительные пути через Next rewrites. */
export function apiBase(): string {
  const raw = typeof process.env.NEXT_PUBLIC_API_URL === 'string' ? process.env.NEXT_PUBLIC_API_URL.trim() : ''
  if (!raw) return ''
  return raw.replace(/\/$/, '')
}

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  const base = apiBase()
  return base ? `${base}${p}` : p
}
