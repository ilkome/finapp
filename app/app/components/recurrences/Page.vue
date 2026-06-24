<script setup lang="ts">
import type { RecurrenceId, RecurrenceItem } from '~/components/recurrences/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { formatByLocale, todayCivilDayEpoch } from '~/components/date/utils'
import { occurrencesInRange, occurrenceTrnId } from '~/components/recurrences/occurrences'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { useRecurrenceTotals } from '~/components/recurrences/useRecurrenceTotals'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { locale, t } = useI18n()
const recurrencesStore = useRecurrencesStore()
const trnsStore = useTrnsStore()
const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()
const { totals } = useRecurrenceTotals()

const dateLocale = computed(() => locale.value.startsWith('ru') ? 'ru' : 'en')

const editingId = ref<RecurrenceId | undefined>()

function openEdit(id: RecurrenceId) {
  editingId.value = id
}

useHead({ title: t('recurrences.title') })

// Manual (autoCreate=false) active rules with due, unrealized, unskipped occurrences.
const pending = computed(() => {
  const today = todayCivilDayEpoch()
  const trns = trnsStore.items ?? {}
  const out: { day: number, id: string, rule: RecurrenceItem }[] = []
  for (const [id, rule] of Object.entries(recurrencesStore.items ?? {})) {
    if (rule.status !== 'active' || rule.autoCreate)
      continue
    for (const day of occurrencesInRange(rule, { end: today, start: rule.anchorDate })) {
      if (!trns[occurrenceTrnId(id, day)])
        out.push({ day, id, rule })
    }
  }
  return out.sort((a, b) => a.day - b.day)
})

function fmtDay(day: number) {
  return formatByLocale(day, 'd MMM yyyy', dateLocale.value)
}
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ t('recurrences.title') }}</UiHeaderTitle>
    </UiHeader>

    <div class="grid max-w-3xl gap-4 px-2 pb-10 lg:px-4">
      <!-- Totals -->
      <div class="grid grid-cols-2 gap-2">
        <div class="bg-elevated rounded-md px-3 py-2">
          <div class="text-2xs text-muted">
            {{ t('recurrences.totals.monthly') }}
          </div>
          <Amount v-if="totals.monthly.expense !== 0" :amount="totals.monthly.expense" :currencyCode="currenciesStore.base" :isShowBaseRate="false" :type="TrnType.Expense" isShowMinus variant="sm" />
          <Amount v-if="totals.monthly.income !== 0" :amount="totals.monthly.income" :currencyCode="currenciesStore.base" :isShowBaseRate="false" :type="TrnType.Income" colorize="income" variant="sm" />
          <div v-if="totals.monthly.expense === 0 && totals.monthly.income === 0" class="text-muted text-sm">
            –
          </div>
        </div>
        <div class="bg-elevated rounded-md px-3 py-2">
          <div class="text-2xs text-muted">
            {{ t('recurrences.totals.yearly') }}
          </div>
          <Amount v-if="totals.yearly.expense !== 0" :amount="totals.yearly.expense" :currencyCode="currenciesStore.base" :isShowBaseRate="false" :type="TrnType.Expense" isShowMinus variant="sm" />
          <Amount v-if="totals.yearly.income !== 0" :amount="totals.yearly.income" :currencyCode="currenciesStore.base" :isShowBaseRate="false" :type="TrnType.Income" colorize="income" variant="sm" />
          <div v-if="totals.yearly.expense === 0 && totals.yearly.income === 0" class="text-muted text-sm">
            –
          </div>
        </div>
      </div>

      <!-- Pending to confirm -->
      <div v-if="pending.length">
        <div class="text-2xs text-muted mb-1 px-1 tracking-wide uppercase">
          {{ t('recurrences.pending.title') }} ({{ pending.length }})
        </div>
        <div class="grid gap-1">
          <div
            v-for="p in pending"
            :key="`${p.id}:${p.day}`"
            class="bg-elevated flex items-center gap-2 rounded-md px-3 py-2"
          >
            <div class="min-w-0 grow">
              <div class="text-highlighted truncate text-sm">
                {{ recurrencesStore.items?.[p.id]?.desc ?? p.rule.categoryId }}
              </div>
              <div class="text-2xs text-muted">
                {{ fmtDay(p.day) }}
              </div>
            </div>
            <Amount
              :amount="p.rule.amount"
              :currencyCode="walletsStore.items?.[p.rule.walletId]?.currency ?? 'USD'"
              :isShowBaseRate="false"
              :type="p.rule.type"
              variant="sm"
            />
            <button
              type="button"
              class="bg-primary/60 text-2xs text-icon-primary hover:bg-primary/80 rounded-sm px-2 py-1"
              @click="recurrencesStore.confirmOccurrence(p.id, p.day)"
            >
              {{ t('recurrences.actions.confirm') }}
            </button>
            <button
              type="button"
              class="bg-default text-2xs text-muted hover:text-highlighted rounded-sm px-2 py-1"
              @click="recurrencesStore.skipOccurrence(p.id, p.day)"
            >
              {{ t('recurrences.actions.skip') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!recurrencesStore.hasItems" class="flex-center grow flex-col py-10 text-center">
        <Icon name="lucide:repeat" size="40" class="text-muted mb-2" />
        <div class="text-muted text-sm">
          {{ t('recurrences.empty') }}
        </div>
      </div>

      <!-- List -->
      <RecurrencesList v-else @edit="openEdit" />
    </div>

    <RecurrencesForm
      v-if="editingId"
      :recurrenceId="editingId"
      @closed="editingId = undefined"
    />
  </UiPage>
</template>
