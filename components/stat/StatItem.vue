<script lang="ts">
import useFilter from '~/modules/filter/useFilter'

export default {
  props: {
    biggest: { type: Number, required: true },
    category: { type: Object, required: true },
    categoryId: { type: String, required: true },
    currency: { type: String, required: true },
    total: { type: Number, required: true },
    type: { type: Number, required: true }
  },

  setup () {
    const { setCategoryFilter } = useFilter()

    return {
      setCategoryFilter
    }
  },

  data () {
    return {
      isShowInside: false
    }
  },

  computed: {
    childCategoriesIds () {
      return this.$store.getters['categories/getChildCategoriesIds'](this.categoryId)
    },

    showChildCategories () {
      const childCatsIdsWithTrns = []
      for (const childCategoryId of this.childCategoriesIds) {
        const trnsIds = this.$store.getters['trns/getTrnsIdsByFilter']({
          categoryId: childCategoryId,
          type: this.type
        })
        if (trnsIds.length > 0)
          childCatsIdsWithTrns.push(childCategoryId)
      }

      if (childCatsIdsWithTrns.length > 0)
        return true

      return false
    },

    styles () {
      return {
        width: `${Math.abs(this.total) / Math.abs(this.biggest) * 100}%`,
        background: this.category.color
      }
    },

    getCatgoryName () {
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
    }
  },

  methods: {
    toogleShowInside () {
      this.isShowInside = !this.isShowInside
    }
  }
}
</script>

<template lang="pug">
.statItem(
  :class="{ _active: isShowInside }"
  @click="toogleShowInside"
)
  .z-10.ins.py-2.px-3.space-x-3.rounded-md.justify-between.items-center.flex.border(
    :class="{ _active: isShowInside, 'dark:border-neutral-800 cursor-n-resize shadow-xl': isShowInside, 'border-transparent cursor-s-resize shadow': !isShowInside }"
  )
    .cursor-pointer.statItem__icon(@click.stop="setCategoryFilter(categoryId)")
      .text-neutral-50.text-2xl.leading-none.w-8.h-8.rounded-full.justify-center.items-center.flex(
      ): div(:class="category.icon" :style="{ color: category.color }")

    .grow
      .space-x-3.flex
        .overflow-hidden.truncate.grow.space-x-2.flex.items-baseline.text-neutral-700(class="dark:text-neutral-400")
          .overflow-hidden.text-sm {{ category.name }}{{ showChildCategories ? '...' : '' }}
          //- pre {{ getCatgoryName }}
          //- .overflow-hidden.space-x-2.items-baseline.flex.truncate.text-xs
          //-   .text-xs(v-for="name in getCatgoryName") {{ name }}

        .statItem__amount
          Amount(
            :currency="currency"
            :value="total"
          )
      .pt-1.statItem__graph.mt-1: .statItem__graph__in(:style="styles")

  //- pre {{ $store.state.categories.items }}
  //- Inside
  .overflow-hidden.ins2.mx-2.rounded-b-md.border.border-t-0(
    v-if="isShowInside"
    class="mt-[-1px] dark:border-neutral-800"
    @click.stop=""
  )
    template(v-if="showChildCategories")
      StatItemChildCats(
        :categoryId="categoryId"
        :type="type"
      )

    template(v-else)
      .statItem__trns
        TrnsList(
          :incomes="type === 1"
          :expenses="type === 0"
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
  background var(--c-item2-bg-hover)

  +media-hover()
    background var(--c-item-bg-hover)

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
