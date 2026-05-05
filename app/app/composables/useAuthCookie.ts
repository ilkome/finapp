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
  const ONE_YEAR = 60 * 60 * 24 * 365
  document.cookie = `finapp.localAuthUid=${encodeURIComponent(uid)};path=/;max-age=${ONE_YEAR};SameSite=Lax${secureSuffix}`
}

export function clearAuthCookie() {
  document.cookie = `finapp.localAuthUid=;path=/;max-age=0;SameSite=Lax${secureSuffix}`
}
