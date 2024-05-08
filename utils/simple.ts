export function uniqueElementsBy<T extends object>(obj: { [key: string]: T }, propertyName: string): string[] {
  const uniqueValues = new Set<string>()

  for (const key in obj) {
    const entry = obj[key]
    uniqueValues.add(entry[propertyName as keyof T] as string)
  }

  return Array.from(uniqueValues)
}
