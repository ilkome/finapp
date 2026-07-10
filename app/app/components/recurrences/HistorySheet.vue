<script setup lang="ts">
import type { RecurrenceId } from '~/components/recurrences/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { epochToCivilParts, formatByLocale, toCivilDayEpoch, todayCivilDayEpoch } from '~/components/date/utils'
import { nextOccurrence, paidCountInRange, priceHistoryTimeline } from '~/components/recurrences/occurrences'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  recurrenceId: RecurrenceId
}>()

const emit = defineEmits<{
  closed: []
}>()

const { locale, t } = useI18n()
const recurrencesStore = useRecurrencesStore()
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()

const dateLocale = computed(() => locale.value.startsWith('ru') ? 'ru' : 'en')

const rule = computed(() => recurrencesStore.items?.[props.recurrenceId])
const category = computed(() => rule.value ? categoriesStore.items?.[rule.value.categoryId] : undefined)
const wallet = computed(() => rule.value ? walletsStore.items?.[rule.value.walletId] : undefined)
const typeLabel = computed(() => rule.value?.type === TrnType.Income ? t('money.income') : t('money.expense'))
const walletCurrency = computed(() => wallet.value?.currency ?? currenciesStore.base)
const seriesName = computed(() => rule.value ? rule.value.desc || category.value?.name || rule.value.categoryId : '')
const contextLine = computed(() => [wallet.value?.name, typeLabel.value, walletCurrency.value].filter(Boolean).join(' · '))

const nextChargeLabel = computed(() => {
  if (!rule.value)
    return t('recurrences.history.noNext')
  const next = nextOccurrence(rule.value, todayCivilDayEpoch())
  return next != null ? formatByLocale(next, 'd MMM yyyy', dateLocale.value) : t('recurrences.history.noNext')
})

// Paid so far in the current civil year (Jan 1 of today's UTC-civil year through today).
const paidThisYear = computed(() => {
  if (!rule.value)
    return 0
  const today = todayCivilDayEpoch()
  const yearStart = toCivilDayEpoch(epochToCivilParts(today).year, 0, 1)
  return paidCountInRange(rule.value, props.recurrenceId, { end: today, start: yearStart }, trnsStore.items ?? {})
})

const hasPriceHistory = computed(() => !!rule.value && priceHistoryTimeline(rule.value).length > 1)
</script>

<template>
  <BottomSheetModal @closed="emit('closed')">
    <UiTitleModal>
      {{ t('recurrences.history.title') }}
    </UiTitleModal>

    <div v-if="rule" class="bottomSheetContentInside scrollerBlock grid content-start gap-4 px-3 py-2">
      <!-- Series context: which subscription this timeline belongs to -->
      <div class="flex items-center gap-2">
        <UiIconBase
          :name="category?.icon ?? 'lucide:repeat'"
          :color="category?.color"
          :size="16"
          class="size-8 shrink-0 p-2"
          invert
        />
        <div class="min-w-0">
          <div class="text-highlighted truncate text-sm">
            {{ seriesName }}
          </div>
          <div class="text-2xs text-muted truncate">
            {{ contextLine }}
          </div>
        </div>
      </div>

      <!-- At-a-glance stats -->
      <div class="grid grid-cols-2 gap-2">
        <div class="bg-elevated rounded-md px-3 py-2">
          <div class="text-2xs text-muted">
            {{ t('recurrences.history.nextCharge') }}
          </div>
          <div class="text-highlighted text-sm">
            {{ nextChargeLabel }}
          </div>
        </div>
        <div class="bg-elevated rounded-md px-3 py-2">
          <div class="text-2xs text-muted">
            {{ t('recurrences.history.paidThisYear') }}
          </div>
          <div class="text-highlighted text-sm">
            {{ paidThisYear }}
          </div>
        </div>
      </div>

      <!-- Price timeline (read-only) -->
      <div class="grid gap-1.5">
        <UiTextSubtitle class="tracking-wide uppercase">
          {{ t('recurrences.history.title') }}
        </UiTextSubtitle>
        <RecurrencesPriceTimeline
          v-if="hasPriceHistory"
          :currency="walletCurrency"
          :rule="rule"
          :type="rule.type"
        />
        <div v-else class="text-2xs text-muted">
          {{ t('recurrences.history.noChanges') }}
        </div>
      </div>
    </div>
  </BottomSheetModal>
</template>
