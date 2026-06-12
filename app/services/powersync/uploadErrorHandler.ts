import type { CrudEntry } from '@powersync/web'

type UploadErrorHandler = (error: Error, divergedOps: CrudEntry[]) => void

// Surfaces fatal (discarded) upload errors to the app; set once from the PowerSync plugin
// so the connector stays free of UI/i18n coupling. Lives outside connector.ts because the
// plugin imports it statically - connector.ts has runtime @powersync/web imports and must
// stay reachable only through the dynamic import in db.ts (entry-chunk size).
let _onFatalUploadError: UploadErrorHandler | null = null

export function setUploadErrorHandler(handler: UploadErrorHandler | null): void {
  _onFatalUploadError = handler
}

export function notifyFatalUploadError(error: Error, divergedOps: CrudEntry[]): void {
  _onFatalUploadError?.(error, divergedOps)
}
