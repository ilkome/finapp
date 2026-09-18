const words = (part: string) => part.match(/[A-Z]?[a-z0-9]+|[A-Z]+(?![a-z])/g) ?? []

// Nuxt's component name: folder words + file words, minus the folder tail the file name already
// starts with (`amount/Amount.vue` -> `Amount`, `bottomSheet/BottomSheetModal.vue` ->
// `BottomSheetModal`) and minus a trailing `Index`.
export function nuxtComponentName(relativePath: string) {
  const parts = relativePath.replace(/\.vue$/, '').split('/')
  const file = words(parts.pop()!).map(word => word.toLowerCase())
  const dir = parts.flatMap(words).map(word => word.toLowerCase())
  if (file.join() === 'index')
    file.length = 0
  let keep = dir.length
  while (keep > 0 && file.slice(0, dir.length - keep + 1).join('/') !== dir.slice(keep - 1).join('/'))
    keep--
  return [...dir.slice(0, keep === 0 ? dir.length : keep - 1), ...file].map(word => word[0]!.toUpperCase() + word.slice(1)).join('')
}
