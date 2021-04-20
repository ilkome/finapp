<script>
import useFilter from '~/modules/filter/useFilter'

export default {
  name: 'FilterRow',

  setup () {
    const { setCategoryFilter, setWalletFilter } = useFilter()

    return {
      setCategoryFilter,
      setWalletFilter
    }
  },

  computed: {
    filterCategory () {
      return this.$store.state.categories.items[this.$store.state.filter.categoryId]
    },

    filterCategoryParent () {
      return this.$store.state.categories.items[this.filterCategory.parentId]
    },

    filterWallet () {
      return this.$store.state.wallets.items[this.$store.state.filter.walletId]
    }
  },

  methods: {
    clearCategoryFilter () {
      const nextCategoryId = this.filterCategory.parentId !== 0 ? this.filterCategory.parentId : null
      this.setCategoryFilter(nextCategoryId)
    },

    clearParentCategoryFilter () {
      this.setCategoryFilter(null)
    },

    clearWalletFilter () {
      this.setWalletFilter(null)
    }
  }
}
</script>

<template lang="pug">
.filterRow.swiper-no-swiping(v-if="$store.state.filter.categoryId || $store.state.filter.walletId")
  //- Wallet
  template(v-if="$store.state.filter.walletId")
    FilterItem(
      :walletId="$store.state.filter.walletId"
      @onClick="clearWalletFilter"
    )

  //- Category
  template(v-if="$store.state.filter.categoryId")
    //- Parent
    template(v-if="filterCategory.parentId !== 0")
      FilterItem(
        :color="filterCategoryParent.color || $store.state.ui.defaultBgColor"
        :icon="filterCategoryParent.icon"
        :name="filterCategoryParent.name"
        @onClick="clearParentCategoryFilter"
      )
    //- Child
    FilterItem(
      :color="filterCategory.color || $store.state.ui.defaultBgColor"
      :icon="filterCategory.icon"
      :name="filterCategory.name"
      @onClick="clearCategoryFilter"
    )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.filterRow
  overflow hidden
  overflow-x scroll
  display flex
  align-items center
  width 100%
  scrollbar()

  +media-tablet('less')
    justify-content safe center
</style>
