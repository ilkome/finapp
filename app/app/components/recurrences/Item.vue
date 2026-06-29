<script setup lang="ts">
import type { RecurrenceId, RecurrenceItem } from '~/components/recurrences/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { formatByLocale, todayCivilDayEpoch } from '~/components/date/utils'
import { nextOccurrence } from '~/components/recurrences/occurrences'
import { useRecurrenceMenuItems } from '~/components/recurrences/useRecurrenceMenuItems'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { TrnType } from '~/components/trns/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { id, rule } = defineProps<{
  id: RecurrenceId
  rule: RecurrenceItem
}>()

const emit = defineEmits<{
  edit: [id: RecurrenceId]
}>()

const { locale, t } = useI18n()
const recurrencesStore = useRecurrencesStore()
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()
const m = useRecurrenceMenuItems()

const dateLocale = computed(() => locale.value.startsWith('ru') ? 'ru' : 'en')
const category = computed(() => categoriesStore.items?.[rule.categoryId])
const wallet = computed(() => walletsStore.items?.[rule.walletId])

const periodLabel = computed(() => {
  const unit = t(`recurrences.unit.${rule.freq}`, rule.interval)
  return rule.interval === 1
    ? t(`recurrences.everyOne.${rule.freq}`)
    : `${t('recurrences.form.every')} ${rule.interval} ${unit}`
})

const next = computed(() => nextOccurrence(rule, todayCivilDayEpoch()))
const nextLabel = computed(() => (next.value ? formatByLocale(next.value, 'd MMM yyyy', dateLocale.value) : undefined))

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
      class="bg-elevated interactive rounded-md px-3 py-2"
      :class="{ 'opacity-60': rule.status !== 'active' }"
      @click="emit('edit', id)"
    >
      <div class="flex items-center gap-2">
        <div
          class="flex size-8 shrink-0 items-center justify-center rounded-full"
          :style="{ background: category?.color ?? 'var(--ui-bg-accented)' }"
        >
          <Icon :name="category?.icon ?? 'lucide:repeat'" size="18" class="text-white" />
        </div>

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
          </div>
        </div>

        <Amount
          :amount="rule.amount"
          :currencyCode="wallet?.currency ?? 'USD'"
          :isShowBaseRate="false"
          :type="rule.type"
          :colorize="rule.type === TrnType.Income ? 'income' : undefined"
          variant="sm"
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
