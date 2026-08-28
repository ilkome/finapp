import { useSupabase, useSupabaseAuth } from '~/composables/useSupabase'
import { createLogger } from '~/utils/logger'

const logger = createLogger('push')

// pushManager.subscribe wants the VAPID key as bytes, not base64url.
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(normalized)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++)
    out[i] = raw.charCodeAt(i)
  return out
}

export function usePushNotifications() {
  const { uid } = useSupabaseAuth()
  const supabase = useSupabase()
  const config = useRuntimeConfig()
  const vapidPublicKey = config.public.vapidPublicKey as string | undefined

  const isSupported = computed(() =>
    import.meta.client
      && 'serviceWorker' in navigator
      && 'PushManager' in window
      && 'Notification' in window,
  )

  // iOS only delivers Web Push to a PWA installed to the home screen.
  const isIos = computed(() =>
    import.meta.client && /iphone|ipad|ipod/i.test(navigator.userAgent),
  )
  const isStandalone = computed(() =>
    import.meta.client
      && (window.matchMedia('(display-mode: standalone)').matches
      // iOS Safari exposes a non-standard standalone flag.
        || (window.navigator as { standalone?: boolean }).standalone === true),
  )
  const needsInstallForIos = computed(() => isIos.value && !isStandalone.value)

  const permission = ref<NotificationPermission>(
    import.meta.client && 'Notification' in window ? Notification.permission : 'default',
  )
  const isSubscribed = ref(false)
  const isBusy = ref(false)

  async function getSubscription(): Promise<PushSubscription | null> {
    if (!isSupported.value)
      return null
    const reg = await navigator.serviceWorker.ready
    return reg.pushManager.getSubscription()
  }

  async function refresh(): Promise<void> {
    if (!isSupported.value)
      return
    permission.value = Notification.permission
    isSubscribed.value = !!(await getSubscription())
  }

  async function subscribe(): Promise<boolean> {
    if (!isSupported.value || !vapidPublicKey || !uid.value)
      return false

    isBusy.value = true
    try {
      permission.value = await Notification.requestPermission()
      if (permission.value !== 'granted')
        return false

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
        userVisibleOnly: true,
      })

      const json = sub.toJSON()
      const now = Date.now()
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          auth: json.keys?.auth,
          createdAt: now,
          endpoint: sub.endpoint,
          p256dh: json.keys?.p256dh,
          updatedAt: now,
          userAgent: navigator.userAgent,
          userId: uid.value,
        }, { onConflict: 'endpoint' })

      if (error) {
        logger.error('failed to store subscription', error)
        await sub.unsubscribe()
        return false
      }

      isSubscribed.value = true
      return true
    }
    catch (err) {
      logger.error('subscribe failed', err)
      return false
    }
    finally {
      isBusy.value = false
    }
  }

  async function unsubscribe(): Promise<boolean> {
    if (!isSupported.value)
      return false

    isBusy.value = true
    try {
      const sub = await getSubscription()
      if (sub) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        await sub.unsubscribe()
      }
      isSubscribed.value = false
      return true
    }
    catch (err) {
      logger.error('unsubscribe failed', err)
      return false
    }
    finally {
      isBusy.value = false
    }
  }

  return {
    isBusy,
    isSubscribed,
    isSupported,
    needsInstallForIos,
    permission,
    refresh,
    subscribe,
    unsubscribe,
  }
}
