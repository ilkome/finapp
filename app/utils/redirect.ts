/**
 * Validates a redirect path to prevent open redirect attacks.
 * Only allows relative paths starting with `/` (not `//` which browsers treat as protocol-relative URLs).
 */
export function getSafeRedirectPath(value: unknown): string {
  if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//'))
    return value
  return '/dashboard'
}
