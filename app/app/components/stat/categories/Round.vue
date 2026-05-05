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

const isIconBg = computed(() => statConfig.config.value.catsRound.isIconBg)

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
        variant="xs"
        colorize="income"
      />
    </div>
  </CategoriesRoundPill>
</template>
