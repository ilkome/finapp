export function generateId() {
  const random = Math.random().toString(36).substring(2, 8)
  return `local_${random}`
}
