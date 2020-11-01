
<script>
export default {
  name: 'StatItemChildCats',

  props: {
    categoryId: {
      type: String,
      required: true
    },
    type: {
      type: Number,
      required: true
    }
  },

  computed: {
    statCategories () {
      const categoriesIds = this.$store.getters['categories/getChildCategoriesIds'](this.categoryId)
      let stat = []

      for (const categoryId of categoriesIds) {
        const trnsIds = this.getTrnsByCategoryId(categoryId)
        if (trnsIds.length > 0) {
          const categoryStat = this.getCategoryStat({ categoryId, trnsIds })
          stat.push(categoryStat)
        }
      }

      stat = stat.sort((a, b) => {
        if (a[this.typeName] > b[this.typeName]) { return -1 }
        if (a[this.typeName] < b[this.typeName]) { return 1 }
        return 0
      })

      return stat
    },

    typeName () {
      return this.type === 1 ? 'incomes' : 'expenses'
    }
  },

  methods: {
    getTrnsByCategoryId (categoryId) {
      const trns = this.$store.state.trns.items
      let trnsIds = this.$store.getters['trns/selectedTrnsIdsWithDate']
      trnsIds = trnsIds.filter(id => trns[id].categoryId === categoryId)
      trnsIds = trnsIds.filter(id => trns[id].type === this.type)
      return trnsIds
    },

    getCategoryStat ({ categoryId, trnsIds }) {
      return {
        categoryId,
        ...this.$store.getters['trns/getTotalOfTrnsIds'](trnsIds)
      }
    }
  }
}
</script>

<template lang="pug">
.items
  template(v-for="category in statCategories")
    StatItemChildCatsItem(
      :biggest="$store.getters['stat/statCurrentPeriod'][typeName].biggest"
      :category="$store.state.categories.items[category.categoryId]"
      :categoryId="category.categoryId"
      :key="category.categoryId"
      :type="type"
      :total="category[typeName]"
    )
</template>

<style lang="stylus" scoped>

</style>
