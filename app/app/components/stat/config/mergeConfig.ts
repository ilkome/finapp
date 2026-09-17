import { createDefu } from 'defu'

/** defu merges arrays by index; a stored or updated list must replace the default one wholesale. */
export const mergeStatConfig = createDefu((obj, key, value) => {
  if (Array.isArray(value)) {
    obj[key] = value
    return true
  }
})
