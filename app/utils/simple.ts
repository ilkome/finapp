export function uniqueElementsBy<T extends object>(obj: { [key: string]: T }, propertyName: string): string[] {
  const uniqueValues = new Set<string>()

  for (const entry of Object.values(obj)) {
    uniqueValues.add(entry[propertyName as keyof T] as string)
  }

  return [...uniqueValues]
}

/** A copy with `item` shifted by `offset` places; unchanged when the item is missing or would leave the list. */
export function moveItem<T>(list: readonly T[], item: T, offset: number): T[] {
  const from = list.indexOf(item)
  const to = from + offset
  if (from < 0 || to < 0 || to >= list.length)
    return [...list]
  const next = [...list]
  next.splice(to, 0, ...next.splice(from, 1))
  return next
}
