import localforage from 'localforage'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { todayCivilDayEpoch } from '~/components/date/utils'
import { useDemo } from '~/components/demo/useDemo'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { dueReminders, reminderKey } from '~/components/recurrences/reminders'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

/**
 * Local due-soon reminders for recurrences (request 4): fires a browser notification 3 days
 * before, the day before, and on the day of each upcoming occurrence. Idempotent per
 * (rule, day, offset) via a localforage-persisted set, so a reminder shows once.
 *
 * This delivers only while a page/service worker is alive. Delivery when the app is closed needs
 * the Web Push backend (VAPID + edge `send-push`) described in plans/push-notifications.md - a
 * follow-up that can reuse dueReminders()/reminderKey() unchanged.
 */
export function useRecurrenceReminders() {
  const { t } = useI18n()
  const { isDemo } = useDemo()
  const recurrencesStore = useRecurrencesStore()
  const categoriesStore = useCategoriesStore()
  const walletsStore = useWalletsStore()

  function canNotify(): boolean {
    return typeof window !== 'undefined'
      && typeof Notification !== 'undefined'
      && Notification.permission === 'granted'
  }

  function offsetLabel(offset: number): string {
    return offset === 0
      ? t('recurrences.reminders.today')
      : offset === 1 ? t('recurrences.reminders.tomorrow') : t('recurrences.reminders.inDays', { count: offset })
  }

  async function run(): Promise<void> {
    if (isDemo.value || !canNotify() || !recurrencesStore.items)
      return

    const reminders = dueReminders(recurrencesStore.items, todayCivilDayEpoch())
    const valid = reminders.map(reminderKey)
    const stored = (await localforage.getItem<string[]>(STORAGE_KEYS.recurrenceReminders)) ?? []
    // Only keep still-relevant keys so the set stays bounded (at most #active-rules × 3).
    const seen = new Set(stored.filter(k => valid.includes(k)))

    for (const r of reminders) {
      if (seen.has(reminderKey(r)))
        continue
      const rule = recurrencesStore.items[r.ruleId]!
      const category = categoriesStore.items?.[rule.categoryId]
      const currency = walletsStore.items?.[rule.walletId]?.currency ?? ''
      const title = t('recurrences.reminders.title')
      const body = `${category?.name ?? rule.desc ?? ''} · ${r.amount} ${currency} · ${offsetLabel(r.offset)}`.trim()
      // eslint-disable-next-line no-new
      new Notification(title, { body, tag: reminderKey(r) })
      seen.add(reminderKey(r))
    }

    await localforage.setItem(STORAGE_KEYS.recurrenceReminders, [...seen])
  }

  return { run }
}
