import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { todayCivilDayEpoch } from '~/components/date/utils'
import { useDemo } from '~/components/demo/useDemo'
import { REMINDER_OFFSETS, upcomingReminders } from '~/components/recurrences/reminders'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { useSupabase, useSupabaseAuth } from '~/composables/useSupabase'
import { createLogger } from '~/utils/logger'

const logger = createLogger('recurrence-reminders')

/**
 * Queue due-soon reminders for the current user's active recurrences (request 4). The client owns
 * the occurrence engine, so it precomputes the next reminders and upserts them into `push_reminders`;
 * the `send-reminders` edge cron delivers them as Web Push (works while the app is closed). Stale
 * unsent rows (from paused/removed/changed rules) are pruned. Idempotent: rows are keyed by
 * occurrence + offset.
 */
export function useRecurrenceReminders() {
  const { t } = useI18n()
  const { isDemo } = useDemo()
  const supabase = useSupabase()
  const { uid } = useSupabaseAuth()
  const recurrencesStore = useRecurrencesStore()
  const categoriesStore = useCategoriesStore()
  const walletsStore = useWalletsStore()

  function offsetLabel(offset: number): string {
    return offset === 0
      ? t('recurrences.reminders.today')
      : offset === 1 ? t('recurrences.reminders.tomorrow') : t('recurrences.reminders.inDays', { count: offset })
  }

  async function sync(): Promise<void> {
    if (isDemo.value || !recurrencesStore.items || !uid.value)
      return

    const today = todayCivilDayEpoch()
    const now = Date.now()
    const reminders = upcomingReminders(recurrencesStore.items, today)

    const rows = reminders.map((r) => {
      const rule = recurrencesStore.items![r.ruleId]!
      const category = categoriesStore.items?.[rule.categoryId]
      const currency = walletsStore.items?.[rule.walletId]?.currency ?? ''
      const name = category?.name ?? rule.desc ?? t('recurrences.reminders.title')
      return {
        body: `${name} · ${r.amount} ${currency} · ${offsetLabel(r.offset)}`.trim(),
        fireDate: r.fireDate,
        id: r.id,
        title: t('recurrences.reminders.title'),
        updatedAt: now,
        userId: uid.value,
      }
    })

    if (rows.length) {
      // sentAt is omitted, so upserting an already-delivered row does not resurrect it.
      const { error } = await supabase.from('push_reminders').upsert(rows, { onConflict: 'id' })
      if (error) {
        logger.error('queue reminders failed', error)
        return
      }
    }

    // Drop future, not-yet-sent rows that are no longer valid (rule paused/deleted/changed).
    const validIds = new Set(rows.map(r => r.id))
    const { data: existing, error: selErr } = await supabase
      .from('push_reminders')
      .select('id')
      .eq('userId', uid.value)
      .is('sentAt', null)
      .gte('fireDate', today)
    if (selErr)
      return
    const stale = (existing ?? []).map(e => e.id as string).filter(id => !validIds.has(id))
    if (stale.length)
      await supabase.from('push_reminders').delete().in('id', stale)
  }

  return { REMINDER_OFFSETS, sync }
}
