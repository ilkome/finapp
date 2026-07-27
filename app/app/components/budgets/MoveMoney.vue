<script setup lang="ts">
import type { BudgetId } from '~/components/budgets/types'
import type { BudgetProgress } from '~/components/budgets/useBudgetProgress'

import { useBudgetsStore } from '~/components/budgets/useBudgetsStore'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'

const props = defineProps<{
  progressFor: (id: BudgetId) => BudgetProgress | undefined
  // The budget receiving money (the one being covered).
  toId: BudgetId
}>()

const emit = defineEmits<{
  closed: []
  confirm: [fromId: BudgetId, baseAmount: number]
}>()

const { t } = useI18n()
const budgetsStore = useBudgetsStore()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()

function nameOf(id: BudgetId) {
  const catId = budgetsStore.items?.[id]?.categoryId
  return (catId && categoriesStore.items?.[catId]?.name) || catId || id
}

const toProgress = computed(() => props.progressFor(props.toId))

// Other active expense budgets you can pull from (those with money available come first).
const candidates = computed(() => {
  const out: { available: number, id: BudgetId, name: string }[] = []
  for (const [id, b] of Object.entries(budgetsStore.activeItems)) {
    if (id === props.toId || b.kind !== 'expense')
      continue
    out.push({ available: props.progressFor(id)?.available ?? 0, id, name: nameOf(id) })
  }
  return out.sort((a, b) => b.available - a.available)
})

const fromId = ref<BudgetId | undefined>()
const amount = ref<string>('')

// What the selected source can actually give up (its available balance, base currency, never < 0).
const sourceAvailable = computed(() => Math.max(0, candidates.value.find(c => c.id === fromId.value)?.available ?? 0))
const amountNumber = computed(() => Number.parseFloat(amount.value))

// Prefill with the destination's shortfall, but never more than the source can spare.
onMounted(() => {
  fromId.value = candidates.value.find(c => c.available > 0)?.id ?? candidates.value[0]?.id
  const shortfall = -(toProgress.value?.available ?? 0)
  if (shortfall > 0)
    amount.value = String(Math.min(Math.ceil(shortfall), Math.floor(sourceAvailable.value)))
})

// Re-clamp when the source changes so the amount can never exceed what the new source has available.
watch(fromId, () => {
  if (amountNumber.value > sourceAvailable.value)
    amount.value = String(Math.floor(sourceAvailable.value))
})

function fillMax() {
  amount.value = String(Math.floor(sourceAvailable.value))
}

const canMove = computed(() =>
  !!fromId.value && Number.isFinite(amountNumber.value) && amountNumber.value > 0 && amountNumber.value <= sourceAvailable.value,
)

function onConfirm(close: () => void) {
  if (!canMove.value || !fromId.value)
    return
  emit('confirm', fromId.value, amountNumber.value)
  close()
}
</script>

<template>
  <BottomSheetModal @closed="emit('closed')">
    <template #default="{ close }">
      <UiTitleModal>
        {{ t('budgets.move.title') }}
      </UiTitleModal>

      <div class="bottomSheetContentInside grid scrollerBlock content-start gap-4 px-3 py-2">
        <!-- Destination -->
        <div class="flex items-center justify-between gap-2 rounded-md bg-elevated/30 px-3 py-2">
          <span class="text-2xs text-muted">{{ t('budgets.move.into') }}</span>
          <span class="text-sm text-highlighted">{{ nameOf(props.toId) }}</span>
          <span class="grow" />
          <Amount
            v-if="toProgress"
            :amount="toProgress.available"
            :colorize="toProgress.available < 0 ? 'expense' : 'income'"
            :currencyCode="currenciesStore.base"
            :isShowBaseRate="false"
            align="left"
            variant="sm"
          />
        </div>

        <!-- Source picker -->
        <FormElement>
          <template #label>
            {{ t('budgets.move.from') }}
          </template>
          <div v-if="candidates.length" class="grid gap-1">
            <button
              v-for="c in candidates"
              :key="c.id"
              type="button"
              class="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm"
              :class="fromId === c.id ? 'bg-primary/15 text-highlighted' : 'bg-elevated/30 text-muted hover:bg-elevated/50'"
              @click="fromId = c.id"
            >
              <span class="truncate">{{ c.name }}</span>
              <Amount :amount="c.available" :currencyCode="currenciesStore.base" :isShowBaseRate="false" align="left" variant="xs" />
            </button>
          </div>
          <div v-else class="text-sm text-muted">
            {{ t('budgets.move.noSource') }}
          </div>
        </FormElement>

        <!-- Amount (base currency), capped at what the source has available -->
        <FormElement v-if="candidates.length">
          <template #label>
            {{ t('budgets.move.amount', { currency: currenciesStore.base }) }}
          </template>
          <FormInput
            v-model="amount"
            type="number"
          />
          <button
            type="button"
            class="mt-1 flex items-center gap-1 text-2xs text-muted hover:text-highlighted"
            @click="fillMax"
          >
            {{ t('budgets.move.available') }}
            <Amount :amount="sourceAvailable" :currencyCode="currenciesStore.base" :isShowBaseRate="false" align="left" variant="xs" />
          </button>
        </FormElement>
      </div>

      <div class="bottomSheetContentBottom">
        <UiButtonAccent
          class="sm:max-w-xs"
          rounded
          :disabled="!canMove"
          @click="onConfirm(close)"
        >
          {{ t('budgets.move.action') }}
        </UiButtonAccent>
      </div>
    </template>
  </BottomSheetModal>
</template>
