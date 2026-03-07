export function uniqueElementsBy<T extends object>(obj: { [key: string]: T }, propertyName: string): string[] {
  const uniqueValues = new Set<string>()

  for (const entry of Object.values(obj)) {
    uniqueValues.add(entry[propertyName as keyof T] as string)
  }

  return Array.from(uniqueValues)
}
