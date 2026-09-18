<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { CategoryWithData } from '~/components/stat/types'

import { useLongPressClick } from '~/components/stat/categories/useLongPressClick'
import { getTrnTypeByAmount } from '~/components/trns/types'

const props = defineProps<{
  category: CategoryItem
  currencyCode: string
  isIconBg?: boolean
  isInlineAmount?: boolean
  isShowAmount?: boolean
  isShowParent?: boolean
  item: CategoryWithData
  parentCategory?: CategoryItem
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
  longPress: [categoryId: CategoryId]
}>()

const isGroupedParent = computed(() => (props.item.categories?.length ?? 0) > 0)

const longPressRef = ref(null)
useLongPressClick(longPressRef, () => props.item.id, {
  onClick: id => emit('click', id),
  onLongPress: id => emit('longPress', id),
})
</script>

<template>
  <CategoriesRoundPillView
    ref="longPressRef"
    :category="props.category"
    :isIconBg="props.isIconBg"
    :isInlineContent="props.isInlineAmount"
    :isShowParent="props.isShowParent"
    :nameSuffix="isGroupedParent ? '...' : undefined"
    :parentCategory="props.parentCategory"
  >
    <div
      v-if="props.isShowAmount"
      class="opacity-90"
    >
      <Amount
        :amount="props.item.value"
        :type="getTrnTypeByAmount(props.item.value)"
        :currencyCode="props.currencyCode"
        :isShowBaseRate="false"
        :isShowSymbol="false"
        align="left"
        variant="compact"
        colorize="income"
      />
    </div>
  </CategoriesRoundPillView>
</template>
