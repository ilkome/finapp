export const HIGHLIGHTED_ITEMS_LIMIT = 5

export function partitionHighlightedItems<T>({
  getMagnitude,
  isRemainder = () => false,
  items,
  limit = HIGHLIGHTED_ITEMS_LIMIT,
}: {
  getMagnitude: (item: T) => number
  isRemainder?: (item: T) => boolean
  items: T[]
  limit?: number
}) {
  const ranked = items
    .map((item, index) => ({ index, item, magnitude: Math.abs(getMagnitude(item)) }))
    .filter(entry => !isRemainder(entry.item) && entry.magnitude > 0)
    .sort((a, b) => b.magnitude - a.magnitude || a.index - b.index)

  return {
    highlighted: ranked.slice(0, limit).map(entry => entry.item),
    remainder: [
      ...ranked.slice(limit).map(entry => entry.item),
      ...items.filter(isRemainder),
    ],
  }
}
