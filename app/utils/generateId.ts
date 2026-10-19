/**
 * Client-generated entity id: a UUIDv7 (RFC 9562), so ids sort by creation time and keep
 * Postgres index inserts local. The id written locally is the same id stored in Postgres.
 */
export function generateId(at = Date.now()): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  let ms = at
  for (let i = 5; i >= 0; i--) {
    bytes[i] = ms % 256
    ms = Math.floor(ms / 256)
  }
  bytes[6] = (bytes[6]! & 0x0F) | 0x70
  bytes[8] = (bytes[8]! & 0x3F) | 0x80
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
