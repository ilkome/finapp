export function hasAuthCookie(): boolean {
  return document.cookie.includes('finapp.localAuthUid')
}

const secureSuffix = globalThis.location?.protocol === 'https:' ? ';Secure' : ''

export function setAuthCookie(uid: string) {
  document.cookie = `finapp.localAuthUid=${encodeURIComponent(uid)};path=/;max-age=31536000;SameSite=Lax${secureSuffix}`
}

export function clearAuthCookie() {
  document.cookie = `finapp.localAuthUid=;path=/;max-age=0;SameSite=Lax${secureSuffix}`
}

export function useAuthCookieSSR() {
  return useCookie('finapp.localAuthUid')
}
