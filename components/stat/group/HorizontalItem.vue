<script lang="ts">
import useFilter from '~/modules/filter/useFilter'

export default {
  props: {
    biggest: { type: Number, required: true },
    category: { type: Object, required: true },
    categoryId: { type: String, required: true },
    currencyCode: { type: String, required: true },
    total: { type: Number, required: true },
    type: { type: Number, required: true },
  },

  setup() {
    const { setFilterCatsId } = useFilter()

    return {
      setFilterCatsId,
    }
  },

  data() {
    return {
      isShowInside: false,
    }
  },

  computed: {
    childCategoriesIds() {
      return this.$store.getters['categories/getChildCategoriesIds'](this.categoryId)
    },

    isCategoryHasChildren() {
      return this.$store.getters['categories/isCategoryHasChildren'](this.categoryId)
    },

    styles() {
      return {
        width: `${Math.abs(this.total) / Math.abs(this.biggest) * 100}%`,
        background: this.category.color,
      }
    },

    getCatgoryName() {
      const cats = []
      const categoriesIds = this.$store.getters['categories/getChildCategoriesIds'](this.categoryId)

      const getTrnsByCategoryId = (categoryId) => {
        const trns = this.$store.state.trns.items
        let trnsIds = this.$store.getters['trns/selectedTrnsIdsWithDate']
        trnsIds = trnsIds.filter(id => trns[id].categoryId === categoryId)
        trnsIds = trnsIds.filter(id => trns[id].type === this.type)
        return trnsIds
      }

      for (const categoryId of categoriesIds) {
        const trnsIds = getTrnsByCategoryId(categoryId)
        if (trnsIds.length > 0)
          cats.push(this.$store.state.categories.items[categoryId]?.name)
      }

      return cats
    },
  },

  methods: {
    toggleShowInside() {
      this.isShowInside = !this.isShowInside
    },
  },
}
</script>

<template lang="pug">
.statItem(
  :class="{ _active: isShowInside }"
  @click="toggleShowInside"
)
  .ins.py-2.px-3.space-x-3.rounded-md.justify-between.items-center.flex.border.dark_border-neutral-800.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
    :class="['z-[9]', { _active: isShowInside }, { 'cursor-n-resize shadow-xl rounded-b-none': isShowInside }, { 'cursor-s-resize shadow-sm': !isShowInside }]"
  )
    //- Icon
    .cursor-pointer.text-neutral-50.text-xl.leading-none.w-8.h-8.rounded-full.justify-center.items-center.flex(
      :style="{ background: category.color }"
      @click.stop="setFilterCatsId(categoryId)"
    ): div(:class="category.icon")

    .grow
      .space-x-3.flex
        .overflow-hidden.truncate.grow.space-x-2.flex.items-baseline.text-neutral-700(class="dark_text-neutral-400")
          .overflow-hidden.text-sm {{ category.name }}{{ isCategoryHasChildren ? '...' : '' }}

        .statItem__amount.text-skin-item-base
          Amount(
            :amount="total"
            :currencyCode="currencyCode"
            :type="type"
            :isShowBaseRate="false"
          )
      .pt-1.statItem__graph.mt-1: .statItem__graph__in(:style="styles")

  //- Inside
  .overflow-hidden.ins2.rounded-b-md.border.border-t-0(
    v-if="isShowInside"
    class="mt-[-1px] dark_border-neutral-800"
    @click.stop=""
  )
    template(v-if="isCategoryHasChildren")
      StatGroupHorizontalItemCat(
        :categoryId="categoryId"
        :type="type"
      )

    template(v-else)
      .statItem__trns
        TrnsList(
          :income="type === 1"
          :expense="type === 0"
          :categoryId="categoryId"
          ui="stat"
        )
</template>

<style lang="stylus">
.statItem
  &__icon
    .icon
      width 36px !important
      height 36px !important
      background var(--c-bg-4)

      .icon__image
        font-size 22px

  .trnItem._stat
    padding-right $m6
    padding-left $m6
</style>

<style lang="stylus" scoped>
.ins2
  position relative
  background var(--c-item2-bg-hover)

.ins
  position relative

.statItem
  &__graph
    &__in
      height 4px
      min-width 2px
      border-radius 3px

  &__name
    overflow hidden
    align-self center
    color var(--c-font-4)
    font-size 14px
    white-space nowrap
    text-overflow ellipsis

  &__icon
    width 32px
</style>
