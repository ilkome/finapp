export function fnv1aNum(str: string): number {
  let hash = 0x811C9DC5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export function xorIdsHash(ids: string[]): string {
  let hash = 0
  for (const id of ids)
    hash = (hash ^ fnv1aNum(id)) >>> 0
  return hash.toString(36)
}
