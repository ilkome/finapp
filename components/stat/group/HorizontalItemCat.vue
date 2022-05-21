<script>
import { getTotal } from '~/components/amount/getTotal'

export default {
  props: {
    categoryId: { type: String, required: true },
    type: { type: Number, required: true },
  },

  computed: {
    statCategories() {
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
        if (a[this.typeName] > b[this.typeName])
          return -1
        if (a[this.typeName] < b[this.typeName])
          return 1
        return 0
      })

      return stat
    },

    typeName() {
      return this.type === 1 ? 'income' : 'expense'
    },
  },

  methods: {
    getTrnsByCategoryId(categoryId) {
      const trns = this.$store.state.trns.items
      let trnsIds = this.$store.getters['trns/selectedTrnsIdsWithDate']
      trnsIds = trnsIds.filter(id => trns[id].categoryId === categoryId)
      trnsIds = trnsIds.filter(id => trns[id].type === this.type)
      return trnsIds
    },

    getCategoryStat({ categoryId, trnsIds }) {
      const trnsItems = this.$store.state.trns.items
      const walletsItems = this.$store.state.wallets.items
      const baseCurrencyCode = this.$store.state.currencies.base
      const rates = this.$store.state.currencies.rates

      const total = getTotal({
        baseCurrencyCode,
        rates,
        trnsIds,
        trnsItems,
        walletsItems,
      })

      return {
        categoryId,
        total: total.sumTransactions,
        incomes: total.incomeTransactions,
        expense: total.expenseTransactions,
      }
    },
  },
}
</script>

<template lang="pug">
div
  StatGroupHorizontalItemCatItem(
    v-for="category in statCategories"
    :key="category.categoryId"
    :biggest="$store.getters['stat/statCurrentPeriod'][typeName].biggest"
    :category="$store.state.categories.items[category.categoryId]"
    :categoryId="category.categoryId"
    :total="category[typeName]"
    :type="type"
  )
</template>
