<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { CategoryWithData } from '~/components/stat/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useCategoryLongPress } from '~/components/stat/categories/useCategoryLongPress'
import { statConfigKey } from '~/components/stat/injectionKeys'
import { getTrnTypeByAmount } from '~/components/trns/types'

const props = defineProps<{
  isShowAmount?: boolean
  isShowParent?: boolean
  item: CategoryWithData
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
}>()

const currenciesStore = useCurrenciesStore()
const statConfig = inject(statConfigKey)!

const isIconBg = computed(() => statConfig.config.value.categories.round.isIconBg)
const isInlineAmount = computed(() => statConfig.config.value.categories.round.isInlineAmount)

const { longPressRef } = useCategoryLongPress(
  () => props.item.id,
  () => emit('click', props.item.id),
)
</script>

<template>
  <CategoriesRoundPill
    ref="longPressRef"
    :categoryId="props.item.id"
    :isIconBg="isIconBg"
    :isInlineContent="isInlineAmount"
    :isShowParent="props.isShowParent"
  >
    <div
      v-if="props.isShowAmount"
      class="opacity-90"
    >
      <Amount
        :amount="props.item.value"
        :type="getTrnTypeByAmount(props.item.value)"
        :currencyCode="currenciesStore.base"
        :isShowBaseRate="false"
        :isShowSymbol="false"
        align="left"
        variant="compact"
        colorize="income"
      />
    </div>
  </CategoriesRoundPill>
</template>
