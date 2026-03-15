export function createLogger(prefix: string, isDev = import.meta.dev) {
  return {
    error: (...args: unknown[]) => console.error(`[${prefix}]`, ...args),
    log: isDev ? (...args: unknown[]) => console.log(`[${prefix}]`, ...args) : () => {},
    warn: (...args: unknown[]) => console.warn(`[${prefix}]`, ...args),
  }
}
