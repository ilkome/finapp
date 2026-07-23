<script setup lang="ts">
import type { RecurrenceId, RecurrenceItem } from '~/components/recurrences/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { formatByLocale, todayCivilDayEpoch } from '~/components/date/utils'
import { recurrenceEveryLabel } from '~/components/recurrences/format'
import { isStaleSubscription, nextOccurrence } from '~/components/recurrences/occurrences'
import { useRecurrenceMenuItems } from '~/components/recurrences/useRecurrenceMenuItems'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { id, rule, selectedId } = defineProps<{
  id: RecurrenceId
  rule: RecurrenceItem
  selectedId?: RecurrenceId
}>()

const emit = defineEmits<{
  edit: [id: RecurrenceId]
  select: [id: RecurrenceId]
}>()

const { locale, t } = useI18n()
const recurrencesStore = useRecurrencesStore()
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()
const m = useRecurrenceMenuItems()

const dateLocale = computed(() => locale.value.startsWith('ru') ? 'ru' : 'en')
const category = computed(() => categoriesStore.items?.[rule.categoryId])
const wallet = computed(() => walletsStore.items?.[rule.walletId])
const isActive = computed(() => rule.status === 'active')
const isSelected = computed(() => selectedId === id)

const periodLabel = computed(() => recurrenceEveryLabel(t, rule.freq, rule.interval))

const next = computed(() => nextOccurrence(rule, todayCivilDayEpoch()))
const nextLabel = computed(() => (next.value ? formatByLocale(next.value, 'd MMM yyyy', dateLocale.value) : undefined))
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
      class="bg-elevated interactive rounded-md border px-3 py-2"
      :class="isSelected ? 'border-primary/40' : 'border-transparent'"
      :style="rule.status !== 'active' ? { opacity: 0.6 } : undefined"
      @click="isActive ? emit('select', id) : emit('edit', id)"
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
          <div class="text-highlighted truncate text-sm">
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
            <span v-if="isStale" class="bg-warning/15 text-warning ml-1 rounded-full px-1.5 py-px" :title="t('recurrences.stale.hint')">{{ t('recurrences.stale.flag') }}</span>
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
          v-if="isActive"
          :name="isSelected ? 'lucide:filter-x' : 'lucide:chevron-right'"
          size="16"
          :class="isSelected ? 'text-primary' : 'text-muted'"
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
