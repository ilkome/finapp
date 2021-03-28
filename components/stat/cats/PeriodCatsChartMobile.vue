<script>
export default {
  name: 'StatCatsPeriodCatsChartMobile',

  props: {
    type: {
      type: String,
      required: true,
      validator (value) {
        return value === 'incomes' || value === 'expenses'
      }
    }
  },

  data () {
    return {
      activeCategoryId: null,
      offset: 0
    }
  },

  computed: {
    className () {
      return {
        _incomes: this.type === 'incomes',
        _expenses: this.type === 'expenses'
      }
    },
    biggestAmount () {
      return this.$store.getters['stat/statCurrentPeriod'][this.type].biggest
    },
    categories () {
      return this.$store.state.categories.items
    },
    statCurrentPeriod () {
      return this.$store.getters['stat/statCurrentPeriod']
    }
  },

  methods: {
    handleActiveCategoryChange ({ categoryId, offset }) {
      if (offset) { this.offset = offset }
      categoryId
        ? this.activeCategoryId = categoryId
        : this.activeCategoryId = null
    }
  }
}
</script>

<template lang="pug">
.statLineCategories(
  v-if="statCurrentPeriod[type].categoriesIds.length > 0"
  :class="className"
)
  StatCatsPeriodCatsChartItem2(
    v-for="categoryId in statCurrentPeriod[type].categoriesIds"
    :biggest="biggestAmount"
    :category="categories[categoryId]"
    :categoryId="categoryId"
    :key="`charts-${categoryId}`"
    :total="statCurrentPeriod.categories[categoryId][type]"
    @onActiveCategoryChange="handleActiveCategoryChange"
  )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.statLineCategories
  overflow hidden
  display flex
  border-radius $m4
</style>
