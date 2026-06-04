'use client'

const COOKIE_KEY = 'gep_uid'
const TTL_DAYS = 365

function generateId(): string {
  return 'u-' + Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function getUserId(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]+)`))
  if (match) return match[1]
  const id = generateId()
  const expires = new Date(Date.now() + TTL_DAYS * 86400 * 1000).toUTCString()
  document.cookie = `${COOKIE_KEY}=${id}; expires=${expires}; path=/; SameSite=Lax`
  return id
}
