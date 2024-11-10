<script setup lang="ts">
import type { MoneyTypeSlugNew } from '~/components/stat/types'
import type { TotalReturns } from '~/components/amount/getTotal'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  selectedType: MoneyTypeSlugNew
  totals: TotalReturns
  type: MoneyTypeSlugNew
}>()

const emit = defineEmits<{
  onClickSum: [type: MoneyTypeSlugNew]
}>()
</script>

<template>
  <div class="pt-3">
    <div
      v-if="props.type === 'sum'"
      class="flex flex-wrap justify-stretch gap-1 md:max-w-md"
    >
      <StatSum
        :amount="-totals.expense"
        :isActive="selectedType === 'expense'"
        :class="[getStyles('item', ['link', 'bg', 'padding3', 'center', 'minh', 'minw1', 'rounded'])]"
        class="grow"
        type="expense"
        @click="emit('onClickSum', 'expense')"
      />
      <StatSum
        :amount="totals.income"
        :isActive="selectedType === 'income'"
        :class="[getStyles('item', ['link', 'bg', 'padding3', 'center', 'minh', 'minw1', 'rounded'])]"
        class="grow"
        type="income"
        @click="emit('onClickSum', 'income')"
      />
      <StatSum
        :amount="totals.sum"
        :class="[getStyles('item', ['link', 'bg', 'padding3', 'center', 'minh', 'minw1', 'rounded'])]"
        class="grow"
        type="sum"
        @click="emit('onClickSum', 'sum')"
      />
    </div>

    <StatSum
      v-else
      :amount="props.type === 'income' ? totals[props.type] : -totals[props.type]"
      :class="[getStyles('item', ['-link', '-bg', 'padding3', 'center', 'minh', 'minw1', 'rounded'])]"
      :type="props.type"
    />
  </div>
</template>
