<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { RecurrenceId } from '~/components/recurrences/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
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

const editingId = ref<RecurrenceId | undefined>()

function openEdit(id: RecurrenceId) {
  editingId.value = id
}

// Тap an active subscription to filter Платежи to just its occurrences; re-tap (or the chip) clears.
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
// Drop a stale filter if the subscription is deleted or no longer active.
watch(() => selectedRuleId.value && recurrencesStore.activeItems[selectedRuleId.value], (rule) => {
  if (selectedRuleId.value && !rule)
    selectedRuleId.value = undefined
})

const sortMode = useStorage<'cost' | 'date'>('finapp.recurrences.sortMode', 'date')
const sortModes = ['date', 'cost'] as const
const activeCount = computed(() => Object.keys(recurrencesStore.activeItems).length)

// Deep link from the transaction form ("part of a recurring series"): ?edit=<ruleId> opens the
// editor once the rule exists locally, then only that key is cleared so a refresh does not reopen it.
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
        <!-- Committed recurring cashflow over the next 12 months; monthly is the smoothed average (yearly / 12). -->
        <div v-if="recurrencesStore.hasItems" class="grid grid-cols-2 gap-2">
          <div class="bg-elevated rounded-md px-3 py-2">
            <UiTextSubtitle>{{ t('recurrences.totals.monthly') }}</UiTextSubtitle>
            <Amount v-if="totals.monthly.expense !== 0" :amount="totals.monthly.expense" :currencyCode="currenciesStore.base" :isShowBaseRate="false" :type="TrnType.Expense" isShowMinus variant="sm" />
            <Amount v-if="totals.monthly.income !== 0" :amount="totals.monthly.income" :currencyCode="currenciesStore.base" :isShowBaseRate="false" :type="TrnType.Income" colorize="income" variant="sm" />
            <div v-if="totals.monthly.expense === 0 && totals.monthly.income === 0" class="text-muted text-sm">
              {{ t('base.noData') }}
            </div>
          </div>
          <div class="bg-elevated rounded-md px-3 py-2">
            <UiTextSubtitle>{{ t('recurrences.totals.yearly') }}</UiTextSubtitle>
            <Amount v-if="totals.yearly.expense !== 0" :amount="totals.yearly.expense" :currencyCode="currenciesStore.base" :isShowBaseRate="false" :type="TrnType.Expense" isShowMinus variant="sm" />
            <Amount v-if="totals.yearly.income !== 0" :amount="totals.yearly.income" :currencyCode="currenciesStore.base" :isShowBaseRate="false" :type="TrnType.Income" colorize="income" variant="sm" />
            <div v-if="totals.yearly.expense === 0 && totals.yearly.income === 0" class="text-muted text-sm">
              {{ t('base.noData') }}
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="!recurrencesStore.hasItems" class="flex-center grow flex-col gap-3 py-10 text-center">
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
          <!-- Подписки: the recurring commitments (rules) -->
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

          <!-- Платежи: the upcoming individual charges (occurrences) -->
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
