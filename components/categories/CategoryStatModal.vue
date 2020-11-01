<script>
export default {
  name: 'CategoryStatModal',

  data () {
    return {
      show: true
    }
  },

  computed: {
    categoryId () {
      return this.$store.state.stat.categoryModal.id
    },

    category () {
      return this.$store.state.categories.items[this.categoryId]
    },

    showChildCategories () {
      const childCategoriesIds = this.$store.getters['categories/getChildCategoriesIds'](this.categoryId)

      const childCatsIdsWithTrns = []
      for (const childCategoryId of childCategoriesIds) {
        const trnsIds = this.$store.getters['trns/getTrnsIdsByFilter']({
          categoryId: childCategoryId,
          type: this.type
        })
        if (trnsIds.length > 0) { childCatsIdsWithTrns.push(childCategoryId) }
      }

      if (childCatsIdsWithTrns.length > 0) { return true }
      return false
    }
  }
}
</script>

<template lang="pug">
Portal(
  v-if="$store.state.stat.categoryModal.show"
  to="modal"
)
  ModalBottom(
    @onClose="$store.commit('stat/setCategoryModalShow', false)"
    @afterClose="$store.commit('stat/setCategoryModalId', null)"
  )
    template(#header)
      .modalBottom__header__title {{ category.name }}
      .modalBottom__icon
        Icon(
          :icon="category.icon"
          :background="category.color || $store.state.ui.defaultBgColor"
          :round="true"
          :big="true"
        )

    template(v-if="showChildCategories")
      StatItemChildCats(:categoryId="categoryId", :type="0")
      StatItemChildCats(:categoryId="categoryId", :type="1")

    template(v-else)
      TrnsList(
        ui="stat"
        :incomes="true"
        :expenses="false"
        :categoryId="categoryId"
      )
</template>

<style lang="stylus" scoped>
// styles here...
</style>
