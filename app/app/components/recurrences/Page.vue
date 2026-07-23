<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { RecurrenceCadence } from '~/components/recurrences/cadence'
import type { RecurrenceId } from '~/components/recurrences/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { nextCadence, scaleByCadence } from '~/components/recurrences/cadence'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { useRecurrenceTotals } from '~/components/recurrences/useRecurrenceTotals'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { TrnType } from '~/components/trns/types'

const { t } = useI18n()
const recurrencesStore = useRecurrencesStore()
const currenciesStore = useCurrenciesStore()
const trnsFormStore = useTrnsFormStore()
const { totals } = useRecurrenceTotals()
const { openDocs } = useDocsLink()

const cadence = useStorage<RecurrenceCadence>('finapp.recurrences.cadence', 'monthly')
const current = computed(() => ({
  expense: scaleByCadence(totals.value.yearly.expense, cadence.value),
  income: scaleByCadence(totals.value.yearly.income, cadence.value),
  perDayExpense: scaleByCadence(totals.value.yearly.expense, 'daily'),
  perDayIncome: scaleByCadence(totals.value.yearly.income, 'daily'),
}))

const currencyRows = computed(() => Object.entries(totals.value.perCurrency))
const showPerCurrency = computed(() => currencyRows.value.length > 1)

const editingId = ref<RecurrenceId | undefined>()

function openEdit(id: RecurrenceId) {
  editingId.value = id
}

const selectedRuleId = ref<RecurrenceId | undefined>()
const paymentsEl = ref<HTMLElement | null>(null)
function onSelect(id: RecurrenceId) {
  if (selectedRuleId.value === id) {
    selectedRuleId.value = undefined
    return
  }
  selectedRuleId.value = id
  nextTick(() => paymentsEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

watch(() => selectedRuleId.value && recurrencesStore.activeItems[selectedRuleId.value], (rule) => {
  if (selectedRuleId.value && !rule)
    selectedRuleId.value = undefined
})

const sortMode = useStorage<'cost' | 'date'>('finapp.recurrences.sortMode', 'date')
const sortModes = ['date', 'cost'] as const
const activeCount = computed(() => Object.keys(recurrencesStore.activeItems).length)

const route = useRoute()
const router = useRouter()
watch(
  () => [route.query.edit, recurrencesStore.items] as const,
  ([edit]) => {
    const id = Array.isArray(edit) ? edit[0] : edit
    if (id && recurrencesStore.items?.[id as RecurrenceId]) {
      openEdit(id as RecurrenceId)
      router.replace({ query: { ...route.query, edit: undefined } })
    }
  },
  { immediate: true },
)

useHead({ title: t('recurrences.title') })
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ t('recurrences.title') }}</UiHeaderTitle>
      <template #actions>
        <UiActionButton :ariaLabel="t('recurrences.add')" @click="trnsFormStore.openFormForCreateRecurrence()">
          <Icon name="lucide:plus" size="22" />
        </UiActionButton>
        <UiActionButton :ariaLabel="t('recurrences.help.open')" @click="openDocs('guide/recurrences')">
          <Icon name="lucide:circle-help" size="20" />
        </UiActionButton>
      </template>
    </UiHeader>

    <div class="grid max-w-3xl gap-4 px-2 pb-10 lg:px-4">
      <template v-if="recurrencesStore.isReady">
        <button
          v-if="recurrencesStore.hasItems"
          type="button"
          :aria-label="t('recurrences.totals.cycle')"
          class="bg-elevated interactive w-full rounded-md px-3 py-2 text-left"
          @click="cadence = nextCadence(cadence)"
        >
          <div class="flex items-center gap-1.5">
            <UiTextSubtitle>{{ t(`recurrences.totals.${cadence}`) }}</UiTextSubtitle>
            <Icon name="lucide:repeat-2" size="12" class="text-muted" />
          </div>

          <div v-if="current.expense === 0 && current.income === 0" class="text-muted text-sm">
            {{ t('base.noData') }}
          </div>
          <template v-else>
            <Amount v-if="current.expense !== 0" :amount="current.expense" :currencyCode="currenciesStore.base" :isShowBaseRate="false" :type="TrnType.Expense" isShowMinus variant="sm" />
            <Amount v-if="current.income !== 0" :amount="current.income" :currencyCode="currenciesStore.base" :isShowBaseRate="false" :type="TrnType.Income" colorize="income" variant="sm" />
          </template>

          <div v-if="current.perDayExpense !== 0 || current.perDayIncome !== 0" class="text-2xs text-muted mt-0.5 flex items-center gap-1">
            <span>≈</span>
            <Amount v-if="current.perDayExpense !== 0" :amount="current.perDayExpense" :currencyCode="currenciesStore.base" :isShowBaseRate="false" :type="TrnType.Expense" isShowMinus variant="2xs" />
            <Amount v-if="current.perDayIncome !== 0" :amount="current.perDayIncome" :currencyCode="currenciesStore.base" :isShowBaseRate="false" :type="TrnType.Income" colorize="income" variant="2xs" />
            <span>{{ t('recurrences.totals.perDay') }}</span>
          </div>

          <div v-if="showPerCurrency" class="text-2xs text-muted mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
            <div v-for="[cur, v] in currencyRows" :key="cur" class="flex items-center gap-1">
              <span class="uppercase">{{ cur }}</span>
              <Amount v-if="v.expense !== 0" :amount="scaleByCadence(v.expense, cadence)" :currencyCode="cur" :isShowBaseRate="false" :type="TrnType.Expense" isShowMinus variant="2xs" />
              <Amount v-if="v.income !== 0" :amount="scaleByCadence(v.income, cadence)" :currencyCode="cur" :isShowBaseRate="false" :type="TrnType.Income" colorize="income" variant="2xs" />
            </div>
          </div>
        </button>

        <!-- Empty state -->
        <div
          v-if="!recurrencesStore.hasItems"
          class="flex-center grow flex-col gap-3 py-10 text-center"
        >
          <Icon name="lucide:repeat" size="40" class="text-muted" />
          <div class="text-muted text-sm">
            {{ t('recurrences.empty') }}
          </div>
          <UiButtonAccent rounded @click="trnsFormStore.openFormForCreateRecurrence()">
            {{ t('recurrences.add') }}
          </UiButtonAccent>
          <div class="text-2xs text-muted max-w-xs text-balance">
            {{ t('recurrences.addHint') }}
          </div>
        </div>

        <template v-else>
          <div>
            <div class="mb-1 flex items-center gap-2 px-1">
              <UiTextSubtitle class="tracking-wide uppercase">
                {{ t('recurrences.subscriptions.title') }}
              </UiTextSubtitle>
              <span class="grow" />
              <div v-if="activeCount > 1" class="flex gap-1">
                <UiTabsItemPill
                  v-for="mode in sortModes"
                  :key="mode"
                  :isActive="sortMode === mode"
                  variant="outline"
                  @click="sortMode = mode"
                >
                  {{ t(`recurrences.sort.${mode}`) }}
                </UiTabsItemPill>
              </div>
            </div>
            <RecurrencesList
              :selectedId="selectedRuleId"
              :sortMode="sortMode"
              @edit="openEdit"
              @select="onSelect"
            />
          </div>

          <div ref="paymentsEl">
            <RecurrencesPayments
              :filterId="selectedRuleId"
              @clearFilter="selectedRuleId = undefined"
            />
          </div>
        </template>
      </template>
    </div>

    <RecurrencesForm
      v-if="editingId"
      :recurrenceId="editingId"
      @closed="editingId = undefined"
    />
  </UiPage>
</template>
