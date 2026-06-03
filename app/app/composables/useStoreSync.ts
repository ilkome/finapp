import { debounce } from 'es-toolkit'
import localforage from 'localforage'

import { errorEmo, random, successEmo, warningEmo } from '~/assets/js/emo'

// Persistence to localforage is only used by demo mode (real mode persists via
// PowerSync's local SQLite). blockPersist guards writes during sign-out cleanup.
let _persistBlocked = false

export function blockPersist(): void {
  _persistBlocked = true
}

export function unblockPersist(): void {
  _persistBlocked = false
}

export function isPersistBlocked(): boolean {
  return _persistBlocked
}

export function createDebouncedPersist<T>(storageKey: string) {
  return debounce((values: T) => {
    if (_persistBlocked)
      return
    localforage.setItem(storageKey, values)
  }, 300)
}

let _toast: ReturnType<typeof useToast> | null = null
let _t: ((key: string, params?: Record<string, unknown>) => string) | null = null

function getToast() {
  if (!_toast)
    _toast = useToast()
  return _toast
}

function getT() {
  if (!_t) {
    const app = tryUseNuxtApp()
    if (app?.$i18n?.t)
      _t = app.$i18n.t
  }
  return _t
}

const emoByType = {
  error: errorEmo,
  success: successEmo,
  warning: warningEmo,
} as const

type ToastType = keyof typeof emoByType

function showToast(type: ToastType, key: string, params?: Record<string, unknown>) {
  const toast = getToast()
  const t = getT()
  return toast.add({ color: type, description: t ? t(key, params ?? {}) : key, title: random(emoByType[type]) })
}

/**
 * Like showToast but with a single action button (e.g. "Reload from server").
 * `onClick` runs when the user taps the action.
 */
export function showActionToast(
  type: ToastType,
  messageKey: string,
  actionLabelKey: string,
  onClick: () => void,
  params?: Record<string, unknown>,
) {
  const toast = getToast()
  const t = getT()
  return toast.add({
    actions: [{ label: t ? t(actionLabelKey) : actionLabelKey, onClick }],
    color: type,
    description: t ? t(messageKey, params ?? {}) : messageKey,
    title: random(emoByType[type]),
  })
}

export function showErrorToast(key: string, params?: Record<string, unknown>) {
  return showToast('error', key, params)
}

export function showSuccessToast(key: string, params?: Record<string, unknown>) {
  return showToast('success', key, params)
}
