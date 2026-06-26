<script setup lang="ts">
import type { BudgetId, BudgetItem, BudgetKind, BudgetPeriodType, BudgetRollover } from '~/components/budgets/types'
import type { CategoryId } from '~/components/categories/types'

import { targetSetAside } from '~/components/budgets/compute'
import { budgetKinds, budgetPeriodTypes, budgetRollovers } from '~/components/budgets/types'
import { useBudgetsStore } from '~/components/budgets/useBudgetsStore'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { civilDayKey, toCivilDayEpoch, todayCivilDayEpoch } from '~/components/date/utils'

const props = defineProps<{
  budgetId?: BudgetId
}>()

const emit = defineEmits<{
  closed: []
}>()

const { t } = useI18n()
const budgetsStore = useBudgetsStore()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()

const existing = computed(() => props.budgetId ? budgetsStore.items?.[props.budgetId] : undefined)

const categoryId = ref<CategoryId | undefined>(existing.value?.categoryId)
const kind = ref<BudgetKind>(existing.value?.kind ?? 'expense')
const amount = ref<string>(existing.value ? String(existing.value.amount) : '')
const amountPeriod = ref<BudgetPeriodType>(existing.value?.amountPeriod ?? 'month')
const currency = ref<string>(existing.value?.currency || currenciesStore.base)
const rollover = ref<BudgetRollover>(existing.value?.rollover ?? 'none')

// Sinking-fund "target by date" (expense only): save goalAmount by goalDate; the per-period
// set-aside is computed, and the budget accumulates (forced surplus rollover).
const isTarget = ref<boolean>(!!(existing.value?.goalAmount && existing.value?.goalDate))
const goalAmount = ref<string>(existing.value?.goalAmount ? String(existing.value.goalAmount) : '')
const goalDateEpoch = ref<number | null>(existing.value?.goalDate ?? null)
const goalAmountNumber = computed(() => Number.parseFloat(goalAmount.value))
const isTargetActive = computed(() => kind.value === 'expense' && isTarget.value)

const goalDateInput = computed({
  get: () => (goalDateEpoch.value != null ? civilDayKey(goalDateEpoch.value) : ''),
  set: (v: string) => {
    if (!v) {
      goalDateEpoch.value = null
      return
    }
    const [y, m, d] = v.split('-').map(Number)
    goalDateEpoch.value = toCivilDayEpoch(y!, m! - 1, d!)
  },
})

// Representative monthly set-aside shown as a hint (the item recomputes per the viewed period).
const setAsideHint = computed(() => {
  if (!isTargetActive.value || goalDateEpoch.value == null || !(goalAmountNumber.value > 0))
    return null
  return Math.round(targetSetAside(goalAmountNumber.value, todayCivilDayEpoch(), goalDateEpoch.value, 'month'))
})

// The amount is stated in the budget's own cadence (the page then normalizes it to the view).
const amountLabel = computed(() => t('budgets.form.amountPer', { period: t(`budgets.periodUnit.${amountPeriod.value}`) }))

const isPickingCategory = ref(false)
const isPickingCurrency = ref(false)

const category = computed(() => categoryId.value ? categoriesStore.items?.[categoryId.value] : undefined)
const categoryHasChildren = computed(() => !!categoryId.value && categoriesStore.hasChildren(categoryId.value))
const amountNumber = computed(() => Number.parseFloat(amount.value))

// One budget per category per kind: a second budget on the same category would double-count its
// spend in the list and in safe-to-spend. The parent/child subtree rollup is handled separately.
const takenCategoryIds = computed(() => {
  const out = new Set<CategoryId>()
  for (const [id, b] of Object.entries(budgetsStore.activeItems)) {
    if (id !== props.budgetId && b.kind === kind.value)
      out.add(b.categoryId)
  }
  return out
})
const categoryTaken = computed(() => !!categoryId.value && takenCategoryIds.value.has(categoryId.value))

const canSave = computed(() => {
  if (!categoryId.value || categoryTaken.value)
    return false
  if (isTargetActive.value)
    return goalAmountNumber.value > 0 && goalDateEpoch.value != null
  return Number.isFinite(amountNumber.value) && amountNumber.value > 0
})

function onSelectCategory(id: CategoryId) {
  categoryId.value = id
  isPickingCategory.value = false
}

function onSave(close: () => void) {
  if (!canSave.value || !categoryId.value)
    return
  const isT = isTargetActive.value
  const values: BudgetItem = {
    amount: isT ? 0 : amountNumber.value,
    amountPeriod: amountPeriod.value,
    categoryId: categoryId.value,
    currency: currency.value,
    goalAmount: isT ? goalAmountNumber.value : null,
    goalDate: isT ? goalDateEpoch.value : null,
    kind: kind.value,
    // A sinking fund must accumulate across periods, so a target forces surplus rollover.
    rollover: isT ? 'surplus' : rollover.value,
    // Preserve the lifecycle status (editing an archived budget must not silently un-archive it).
    status: existing.value?.status ?? 'active',
    updatedAt: Date.now(),
    ...(existing.value?.bucket ? { bucket: existing.value.bucket } : {}),
  }
  budgetsStore.saveBudget(values, props.budgetId)
  close()
}
</script>

<template>
  <BottomSheetModal @closed="emit('closed')">
    <template #default="{ close }">
      <UiTitleModal>
        {{ props.budgetId ? t('base.edit') : t('budgets.add') }}
      </UiTitleModal>

      <div class="bottomSheetContentInside scrollerBlock grid content-start gap-5 px-3 py-2">
        <!-- Category -->
        <FormElement>
          <template #label>
            {{ t('budgets.form.category') }}
          </template>
          <UiButtonWithRight @click="isPickingCategory = true">
            <template #value>
              <span
                v-if="category"
                class="flex size-5 shrink-0 items-center justify-center rounded-full"
                :style="{ background: category.color ?? 'var(--ui-bg-accented)' }"
              >
                <Icon :name="category.icon ?? 'lucide:folder'" size="12" class="text-white" />
              </span>
              <span :class="category ? 'text-highlighted' : 'text-muted'">
                {{ category?.name ?? t('budgets.form.selectCategory') }}
              </span>
            </template>
          </UiButtonWithRight>
          <div v-if="categoryHasChildren" class="text-2xs text-muted flex items-center gap-1 px-1 pt-1">
            <Icon name="lucide:info" size="12" />
            {{ t('budgets.form.subtreeHint') }}
          </div>
          <div v-if="categoryTaken" class="text-2xs text-error flex items-center gap-1 px-1 pt-1">
            <Icon name="lucide:triangle-alert" size="12" />
            {{ t('budgets.form.categoryTaken', { kind: t(`budgets.kind.${kind}`) }) }}
          </div>
        </FormElement>

        <!-- Kind -->
        <FormElement>
          <template #label>
            {{ t('budgets.form.kind') }}
          </template>
          <UiTabsBar>
            <UiTabsItemPill
              v-for="k in budgetKinds"
              :key="k"
              :isActive="kind === k"
              @click="kind = k"
            >
              {{ t(`budgets.kind.${k}`) }}
            </UiTabsItemPill>
          </UiTabsBar>
        </FormElement>

        <!-- Target by date (sinking fund), expense only -->
        <UiSwitchItem
          v-if="kind === 'expense'"
          :checkboxValue="isTarget"
          :title="t('budgets.form.targetToggle')"
          @click="isTarget = !isTarget"
        />

        <template v-if="isTargetActive">
          <!-- Goal amount -->
          <FormElement>
            <template #label>
              {{ t('budgets.form.goalAmount') }}
            </template>
            <FormInput
              v-model="goalAmount"
              :placeholder="t('budgets.form.goalAmount')"
              type="number"
            />
          </FormElement>

          <!-- Goal date -->
          <FormElement>
            <template #label>
              {{ t('budgets.form.goalDate') }}
            </template>
            <input
              v-model="goalDateInput"
              type="date"
              class="bg-elevated/30 text-highlighted min-h-[42px] rounded-md px-3 py-2 text-sm"
            >
            <div v-if="setAsideHint != null" class="text-2xs text-muted flex items-center gap-1 px-1 pt-1">
              <Icon name="lucide:piggy-bank" size="12" />
              {{ t('budgets.form.setAsideHint', { amount: setAsideHint, currency }) }}
            </div>
          </FormElement>
        </template>

        <template v-else>
          <!-- Cadence: the rhythm the amount is for. The page normalizes it to the viewed timeframe. -->
          <FormElement>
            <template #label>
              {{ t('budgets.form.cadence') }}
            </template>
            <UiTabsBar>
              <UiTabsItemPill
                v-for="p in budgetPeriodTypes"
                :key="p"
                :isActive="amountPeriod === p"
                @click="amountPeriod = p"
              >
                {{ t(`budgets.period.${p}`) }}
              </UiTabsItemPill>
            </UiTabsBar>
          </FormElement>

          <!-- Amount -->
          <FormElement>
            <template #label>
              {{ amountLabel }}
            </template>
            <FormInput
              v-model="amount"
              :placeholder="amountLabel"
              type="number"
            />
          </FormElement>
        </template>

        <!-- Currency: the currency the amount is stated in (converted to base at read time). -->
        <FormElement>
          <template #label>
            {{ t('budgets.form.currency') }}
          </template>
          <UiButtonWithRight @click="isPickingCurrency = true">
            <template #value>
              {{ currency }}
            </template>
          </UiButtonWithRight>
        </FormElement>

        <!-- Rollover (a target implies surplus rollover, so it's hidden then) -->
        <FormElement v-if="!isTargetActive">
          <template #label>
            {{ t('budgets.form.rollover') }}
          </template>
          <div class="flex flex-wrap gap-1">
            <UiTabsItemPill
              v-for="r in budgetRollovers"
              :key="r"
              :isActive="rollover === r"
              variant="outline"
              @click="rollover = r"
            >
              {{ t(`budgets.rollover.${r}`) }}
            </UiTabsItemPill>
          </div>
        </FormElement>
      </div>

      <!-- Pinned footer (lives in the sheet's auto row, never scrolls away) -->
      <div class="bottomSheetContentBottom">
        <UiButtonAccent
          class="sm:max-w-xs"
          rounded
          :disabled="!canSave"
          @click="onSave(close)"
        >
          {{ t('base.save') }}
        </UiButtonAccent>
      </div>

      <CurrenciesModal
        v-if="isPickingCurrency"
        :activeCode="currency"
        @select="(c: string) => { currency = c; isPickingCurrency = false }"
        @close="isPickingCurrency = false"
      />

      <BottomSheetModal
        v-if="isPickingCategory"
        @closed="isPickingCategory = false"
      >
        <div class="bottomSheetContentInside scrollerBlock h-[70vh]">
          <CategoriesSelectorModal
            :activeItemId="categoryId"
            selectableParents
            @selected="onSelectCategory"
          />
        </div>
      </BottomSheetModal>
    </template>
  </BottomSheetModal>
</template>
