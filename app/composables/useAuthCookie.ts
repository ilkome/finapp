// Track whether we've already initialized the cross-domain session
// to avoid calling getSession() on every navigation (which triggers
// $sessionSignal → useSession refetch → get-session → signal → loop)
let _sessionInitialized = false

export function isSessionInitialized(): boolean {
  return _sessionInitialized
}

export function setSessionInitialized(value: boolean) {
  _sessionInitialized = value
}

export function hasAuthCookie(): boolean {
  return /(?:^|;\s*)finapp\.localAuthUid=/.test(document.cookie)
}

const secureSuffix = globalThis.location?.protocol === 'https:' ? ';Secure' : ''

export function setAuthCookie(uid: string) {
  document.cookie = `finapp.localAuthUid=${encodeURIComponent(uid)};path=/;max-age=31536000;SameSite=Lax${secureSuffix}`
}

export function clearAuthCookie() {
  document.cookie = `finapp.localAuthUid=;path=/;max-age=0;SameSite=Lax${secureSuffix}`
}
