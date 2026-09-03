<script setup lang="ts">
import type { HistoryDescriptionFilter } from '~/components/trns/history/types'
import type { TrnsViewType } from '~/components/trns/types'

import { historyFiltersKey } from '~/components/trns/history/injectionKeys'

const filters = inject(historyFiltersKey)!
const { t } = useI18n()

const typeItems = computed(() => [
  { label: t('trns.historyTable.filters.allTypes'), value: 'all' },
  { label: t('trns.historyTable.types.expense'), value: 'expense' },
  { label: t('trns.historyTable.types.income'), value: 'income' },
  { label: t('trns.historyTable.types.transfer'), value: 'transfer' },
  { label: t('trns.historyTable.types.adjustment'), value: 'adjustment' },
])

const descriptionItems = computed(() => [
  { label: t('trns.historyTable.filters.allDescriptions'), value: 'all' },
  { label: t('trns.historyTable.filters.withDescription'), value: 'with' },
  { label: t('trns.historyTable.filters.withoutDescription'), value: 'without' },
])

const isDateOpen = ref(false)
const isAmountOpen = ref(false)
const hasDate = computed(() => filters.dateStart.value !== null || filters.dateEnd.value !== null)
const hasAmount = computed(() => !!filters.amountMin.value || !!filters.amountMax.value)
</script>

<template>
  <div class="grid gap-2 p-2 md:p-3">
    <div class="flex min-w-0 flex-wrap items-center gap-1.5">
      <UInput
        v-model="filters.search.value"
        class="min-w-52 flex-1"
        icon="i-lucide-search"
        :placeholder="t('trns.historyTable.filters.search')"
        size="xl"
      >
        <template v-if="filters.search.value" #trailing>
          <UButton
            :aria-label="t('base.clear')"
            color="neutral"
            icon="i-lucide-x"
            size="sm"
            variant="link"
            @click="filters.search.value = ''"
          />
        </template>
      </UInput>

      <USelect
        class="min-w-42"
        :items="typeItems"
        :modelValue="filters.type.value"
        size="xl"
        valueKey="value"
        @update:modelValue="filters.setType($event as TrnsViewType)"
      />

      <USelect
        class="min-w-48"
        :items="descriptionItems"
        :modelValue="filters.description.value"
        size="xl"
        valueKey="value"
        @update:modelValue="filters.setDescription($event as HistoryDescriptionFilter)"
      />

      <FilterSelector isShowCategories isShowWallets />

      <BottomSheetOrDropdown
        :isOpen="isDateOpen"
        :title="t('trns.historyTable.filters.period')"
        isShowCloseBtn
        @closeModal="isDateOpen = false"
        @openModal="isDateOpen = true"
      >
        <template #trigger="{ isActive }">
          <UiTriggerButton
            :hasSelection="hasDate"
            icon="lucide:calendar-range"
            :isActive="isActive"
            :title="t('trns.historyTable.filters.period')"
          />
        </template>
        <template #content>
          <div class="grid min-w-80 gap-2 p-3">
            <FormDate
              clearable
              :modelValue="filters.dateStart.value"
              :placeholder="t('trns.historyTable.filters.dateStart')"
              @update:modelValue="filters.setDateStart"
            />
            <FormDate
              clearable
              :modelValue="filters.dateEnd.value"
              :placeholder="t('trns.historyTable.filters.dateEnd')"
              @update:modelValue="filters.setDateEnd"
            />
          </div>
        </template>
      </BottomSheetOrDropdown>

      <BottomSheetOrDropdown
        :isOpen="isAmountOpen"
        :title="t('trns.historyTable.filters.amount')"
        isShowCloseBtn
        @closeModal="isAmountOpen = false"
        @openModal="isAmountOpen = true"
      >
        <template #trigger="{ isActive }">
          <UiTriggerButton
            :hasSelection="hasAmount"
            icon="lucide:badge-dollar-sign"
            :isActive="isActive"
            :title="t('trns.historyTable.filters.amount')"
          />
        </template>
        <template #content>
          <div class="grid min-w-72 grid-cols-2 gap-2 p-3">
            <UInput
              v-model="filters.amountMin.value"
              inputmode="decimal"
              :placeholder="t('trns.historyTable.filters.minimum')"
              size="xl"
              type="number"
            />
            <UInput
              v-model="filters.amountMax.value"
              inputmode="decimal"
              :placeholder="t('trns.historyTable.filters.maximum')"
              size="xl"
              type="number"
            />
          </div>
        </template>
      </BottomSheetOrDropdown>

      <UiActionButton
        v-if="filters.hasFilters.value"
        :ariaLabel="t('base.reset')"
        @click="filters.clear"
      >
        <Icon name="lucide:rotate-ccw" size="18" />
      </UiActionButton>
    </div>

    <FilterSelected
      v-if="filters.entityFilter.isShow.value"
      isShowCategories
      isShowWallets
    />
  </div>
</template>
