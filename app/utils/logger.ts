const isDev = import.meta.dev

export function createLogger(prefix: string) {
  return {
    error: (...args: unknown[]) => console.error(`[${prefix}]`, ...args),
    log: isDev ? (...args: unknown[]) => console.log(`[${prefix}]`, ...args) : () => {},
  }
}
