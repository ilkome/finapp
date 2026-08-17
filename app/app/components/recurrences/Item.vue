<script setup lang="ts">
import { formatDateWithOptionalYear, todayCivilDayEpoch } from '~~/utils/date/civil'

import type { RecurrenceId, RecurrenceItem } from '~/components/recurrences/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { recurrenceEveryLabel } from '~/components/recurrences/format'
import { isStaleSubscription, nextOccurrence } from '~/components/recurrences/occurrences'
import { useRecurrenceMenuItems } from '~/components/recurrences/useRecurrenceMenuItems'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { id, rule } = defineProps<{
  id: RecurrenceId
  rule: RecurrenceItem
}>()

const emit = defineEmits<{
  edit: [id: RecurrenceId]
}>()

const { t } = useI18n()
const router = useRouter()
const recurrencesStore = useRecurrencesStore()
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()
const m = useRecurrenceMenuItems()

const dateLocale = useDateLocale()
const category = computed(() => categoriesStore.items?.[rule.categoryId])
const wallet = computed(() => walletsStore.items?.[rule.walletId])

const periodLabel = computed(() => recurrenceEveryLabel(t, rule.freq, rule.interval))

const next = computed(() => nextOccurrence(rule, todayCivilDayEpoch()))
const nextLabel = computed(() => (next.value ? formatDateWithOptionalYear(next.value, 'd MMM', dateLocale.value) : undefined))
const isStale = computed(() => isStaleSubscription(rule, id, trnsStore.items ?? {}, todayCivilDayEpoch()))

const confirmCancel = ref(false)
const confirmDelete = ref(false)

const contextMenuItems = computed(() => {
  const lifecycle = rule.status === 'active'
    ? [
        m.pause(id, () => recurrencesStore.setStatus(id, 'paused')),
        ...(next.value ? [m.skipNext(id, () => recurrencesStore.skipOccurrence(id, next.value!))] : []),
      ]
    : [m.resume(id, () => recurrencesStore.setStatus(id, 'active'))]

  return [
    [m.edit(id, eid => emit('edit', eid)), ...lifecycle],
    ...(rule.status !== 'cancelled' ? [[m.cancel(id, () => { confirmCancel.value = true })]] : []),
    [m.delete(id, () => { confirmDelete.value = true })],
  ]
})
</script>

<template>
  <UiContextMenuMy :items="contextMenuItems">
    <div
      class="rounded-md border border-transparent interactive bg-elevated px-3 py-2"
      :style="rule.status !== 'active' ? { opacity: 0.6 } : undefined"
      @click="router.push(`/recurrences/${id}`)"
    >
      <div class="flex items-center gap-2">
        <UiIconBase
          :name="category?.icon ?? 'lucide:repeat'"
          :color="category?.color"
          :size="18"
          class="size-8 shrink-0 p-1.5"
          invert
        />

        <div class="min-w-0 grow">
          <div class="truncate text-sm text-highlighted">
            {{ category?.name ?? rule.categoryId }}
            <span v-if="rule.desc" class="text-muted"> · {{ rule.desc }}</span>
          </div>
          <div class="text-2xs text-muted">
            {{ periodLabel }}
            <template v-if="rule.status === 'active' && nextLabel">
              · {{ t('recurrences.next') }} {{ nextLabel }}
            </template>
            <template v-if="rule.status !== 'active'">
              · {{ t(`recurrences.status.${rule.status}`) }}
            </template>
            <template v-if="!rule.autoCreate">
              · {{ t('recurrences.manual') }}
            </template>
            <span v-if="isStale" class="ml-1 rounded-full bg-warning/15 px-1.5 py-px text-warning" :title="t('recurrences.stale.hint')">{{ t('recurrences.stale.flag') }}</span>
          </div>
        </div>

        <Amount
          :amount="rule.amount"
          :currencyCode="wallet?.currency ?? currenciesStore.base"
          :isShowBaseRate="false"
          :type="rule.type"
          :colorize="rule.type === TrnType.Income ? 'income' : undefined"
          variant="sm"
        />
        <Icon
          name="lucide:chevron-right"
          size="16"
          class="text-muted"
        />
      </div>
    </div>
  </UiContextMenuMy>

  <LayoutConfirmModal
    v-if="confirmCancel"
    :title="t('recurrences.confirm.cancelTitle')"
    :description="t('recurrences.confirm.cancelText')"
    :confirmLabel="t('recurrences.actions.cancel')"
    @closed="confirmCancel = false"
    @confirm="recurrencesStore.setStatus(id, 'cancelled')"
  />

  <LayoutConfirmModal
    v-if="confirmDelete"
    :title="t('recurrences.confirm.deleteTitle')"
    :description="t('recurrences.confirm.deleteText')"
    @closed="confirmDelete = false"
    @confirm="recurrencesStore.removeRecurrence(id)"
  />
</template>
