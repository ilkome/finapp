<script setup lang="ts">
import type { BudgetId, BudgetItem, BudgetKind, BudgetPeriodType, BudgetRollover } from '~/components/budgets/types'
import type { CategoryId } from '~/components/categories/types'

import { budgetKinds, budgetPeriodTypes, budgetRollovers } from '~/components/budgets/types'
import { useBudgetsStore } from '~/components/budgets/useBudgetsStore'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'

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

// The amount is stated in the budget's own cadence (the page then normalizes it to the view).
const amountLabel = computed(() => t('budgets.form.amountPer', { period: t(`budgets.periodUnit.${amountPeriod.value}`) }))

const isPickingCategory = ref(false)
const isPickingCurrency = ref(false)
const confirmDelete = ref(false)

const category = computed(() => categoryId.value ? categoriesStore.items?.[categoryId.value] : undefined)
const categoryHasChildren = computed(() => !!categoryId.value && categoriesStore.hasChildren(categoryId.value))
const amountNumber = computed(() => Number.parseFloat(amount.value))
const canSave = computed(() => !!categoryId.value && Number.isFinite(amountNumber.value) && amountNumber.value > 0)

function onSelectCategory(id: CategoryId) {
  categoryId.value = id
  isPickingCategory.value = false
}

function onSave() {
  if (!canSave.value || !categoryId.value)
    return
  const values: BudgetItem = {
    amount: amountNumber.value,
    amountPeriod: amountPeriod.value,
    categoryId: categoryId.value,
    currency: currency.value,
    kind: kind.value,
    rollover: rollover.value,
    status: 'active',
    updatedAt: Date.now(),
    ...(existing.value?.bucket ? { bucket: existing.value.bucket } : {}),
  }
  budgetsStore.saveBudget(values, props.budgetId)
  emit('closed')
}

function onDelete() {
  if (props.budgetId)
    budgetsStore.removeBudget(props.budgetId)
  emit('closed')
}
</script>

<template>
  <BottomSheetModal @closed="emit('closed')">
    <UiTitleModal>
      {{ props.budgetId ? t('budgets.actions.edit') : t('budgets.add') }}
    </UiTitleModal>

    <div class="bottomSheetContentInside grid gap-4 px-3 pb-6">
      <!-- Category -->
      <div class="grid gap-1">
        <div class="text-2xs text-muted tracking-wide uppercase">
          {{ t('budgets.form.category') }}
        </div>
        <button
          type="button"
          class="bg-elevated/30 hover:bg-elevated/50 flex min-h-[42px] items-center gap-2 rounded-md px-3 py-2 text-left"
          @click="isPickingCategory = true"
        >
          <div
            v-if="category"
            class="flex size-7 shrink-0 items-center justify-center rounded-full"
            :style="{ background: category.color ?? 'var(--ui-bg-accented)' }"
          >
            <Icon :name="category.icon ?? 'lucide:folder'" size="16" class="text-white" />
          </div>
          <span :class="category ? 'text-highlighted' : 'text-muted'">
            {{ category?.name ?? t('budgets.form.selectCategory') }}
          </span>
        </button>
        <div v-if="categoryHasChildren" class="text-2xs text-muted flex items-center gap-1 px-1">
          <Icon name="lucide:info" size="12" />
          {{ t('budgets.form.subtreeHint') }}
        </div>
      </div>

      <!-- Kind -->
      <div class="grid gap-1">
        <div class="text-2xs text-muted tracking-wide uppercase">
          {{ t('budgets.form.kind') }}
        </div>
        <div class="flex gap-1">
          <button
            v-for="k in budgetKinds"
            :key="k"
            type="button"
            class="grow rounded-md px-3 py-2 text-sm"
            :class="kind === k ? 'bg-primary/70 text-icon-primary' : 'bg-elevated/30 text-muted hover:bg-elevated/50'"
            @click="kind = k"
          >
            {{ t(`budgets.kind.${k}`) }}
          </button>
        </div>
      </div>

      <!-- Cadence: the rhythm the amount is for. The page normalizes it to the viewed timeframe. -->
      <div class="grid gap-1">
        <div class="text-2xs text-muted tracking-wide uppercase">
          {{ t('budgets.form.cadence') }}
        </div>
        <div class="flex gap-1">
          <button
            v-for="p in budgetPeriodTypes"
            :key="p"
            type="button"
            class="grow rounded-md px-3 py-2 text-sm"
            :class="amountPeriod === p ? 'bg-primary/70 text-icon-primary' : 'bg-elevated/30 text-muted hover:bg-elevated/50'"
            @click="amountPeriod = p"
          >
            {{ t(`budgets.period.${p}`) }}
          </button>
        </div>
      </div>

      <!-- Amount -->
      <div class="grid gap-1">
        <div class="text-2xs text-muted tracking-wide uppercase">
          {{ amountLabel }}
        </div>
        <FormInput
          v-model="amount"
          :placeholder="amountLabel"
          type="number"
        />
      </div>

      <!-- Currency: the currency the amount is stated in (converted to base at read time). -->
      <div class="grid gap-1">
        <div class="text-2xs text-muted tracking-wide uppercase">
          {{ t('budgets.form.currency') }}
        </div>
        <button
          type="button"
          class="bg-elevated/30 hover:bg-elevated/50 flex min-h-[42px] items-center justify-between gap-2 rounded-md px-3 py-2 text-left"
          @click="isPickingCurrency = true"
        >
          <span class="text-highlighted">{{ currency }}</span>
          <Icon name="lucide:chevron-down" size="16" class="text-muted shrink-0" />
        </button>
      </div>

      <!-- Rollover -->
      <div class="grid gap-1">
        <div class="text-2xs text-muted tracking-wide uppercase">
          {{ t('budgets.form.rollover') }}
        </div>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="r in budgetRollovers"
            :key="r"
            type="button"
            class="rounded-md px-3 py-2 text-xs"
            :class="rollover === r ? 'bg-primary/70 text-icon-primary' : 'bg-elevated/30 text-muted hover:bg-elevated/50'"
            @click="rollover = r"
          >
            {{ t(`budgets.rollover.${r}`) }}
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-2 flex items-center gap-2">
        <button
          type="button"
          class="bg-primary text-icon-primary grow rounded-md px-3 py-2 text-sm disabled:opacity-40"
          :disabled="!canSave"
          @click="onSave"
        >
          {{ t('budgets.actions.save') }}
        </button>
        <button
          v-if="props.budgetId"
          type="button"
          class="bg-default text-error rounded-md px-3 py-2 text-sm hover:opacity-80"
          @click="confirmDelete = true"
        >
          {{ t('budgets.actions.delete') }}
        </button>
      </div>
    </div>

    <LayoutConfirmModal
      v-if="confirmDelete"
      :title="t('budgets.confirm.deleteTitle')"
      :description="t('budgets.confirm.deleteText')"
      @closed="confirmDelete = false"
      @confirm="onDelete"
    />

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
  </BottomSheetModal>
</template>
