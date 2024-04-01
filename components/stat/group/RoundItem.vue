<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { CurrencyCode } from '~/components/currencies/types'
import type { MoneyTypeNumber } from '~/components/stat/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useFilterStore } from '~/components/filter/useFilterStore'
import { useTrnForm } from '~/components/trnForm/useTrnForm'
import type { FilterProvider } from '~/components/filter/useFilter'

const props = defineProps<{
  category: CategoryItem
  categoryId: CategoryId
  currencyCode: CurrencyCode
  total: number
  moneyTypeNumber: MoneyTypeNumber
}>()

const filter = inject('period') as FilterProvider

const categoriesStore = useCategoriesStore()
const { trnFormCreate } = useTrnForm()

const isCategoryHasChildren = computed(() =>
  categoriesStore.isCategoryHasChildren(props.categoryId),
)
</script>

<template>
  <div
    v-if="category"
    class="statItemRound flex-center group hocus_bg-item-5 p-2 rounded-lg"
    :class="{ _prevStat: total === 0 }"
    data-long-press-delay="300"
    @click="() => trnFormCreate({ categoryId })"
  >
    <Icon2
      :categoryId="categoryId"
      :color="category.color"
      :icon="category.icon"
      size="lg"
      @click="id => filter.toggleCategoryId(id)"
    />

    <div
      class="statItemRound__name js-getWidth"
      :class="{ _isCategoryHasChildren: isCategoryHasChildren }"
    >
      {{ category.name }}{{ isCategoryHasChildren ? "..." : "" }}
    </div>

    <div class="statItemRound__amount js-getWidth text-item-base">
      <Amount
        :amount="total"
        :currencyCode="currencyCode"
        :type="moneyTypeNumber"
        :isShowBaseRate="false"
      />
    </div>
  </div>
</template>

<style lang="stylus">
// TODO: style
.statItemRound
  max-width 160px

  &__icon
    .icon
      width 36px !important
      height 36px !important
      background var(--c-bg-4) !important

      .icon__image
        font-size 22px
</style>

<style lang="stylus" scoped>
@import "../assets/stylus/variables"

.statItemRound
  flex-flow column

  &._prevStat
    opacity .5

  &._active
    margin-bottom 26px

  &__name
    padding 6px 0 2px 0
    color var(--c-font-4)
    font-size 12px
    text-align center

    ^[0]._active &
      color var(--c-font-2)
      font-weight 500

    &._isCategoryHasChildren
      margin-right -8px
</style>
