<script>
export default {
  methods: {
    handleCategoryClick (categoryId) {
      if (this.$store.getters['categories/getChildCategoriesIds'](categoryId).length > 0) {
        this.$store.commit('trnForm/setTrnFormModalCategoryId', categoryId)
        this.$store.commit('trnForm/showTrnFormModal', 'categoriesChild')
      }
      else {
        this.$store.commit('trnForm/closeTrnFormModal', 'categories')
        this.$store.commit('trnForm/closeTrnFormModal', 'categoriesChild')
        this.$store.commit('trnForm/setTrnFormValues', { categoryId })
      }
    }
  }
}
</script>

<template lang="pug">
LazyTrnFormModal(
  :show="$store.state.trnForm.modal.categories"
  :title="$lang.categories.name"
  :position="$store.state.ui.mobile ? 'bottom' : null"
  @onClose="$store.commit('trnForm/toogleTrnFormModal', 'categories')"
)
  template(v-if="$store.getters['categories/quickSelectorCategoriesIds'].length")
    .marginBottom
      .formTitle Favorite categories
      CategoriesView(
        :ids="$store.getters['categories/quickSelectorCategoriesIds']"
        ui="_flat"
        :noPaddingBottom="true"
        @onClick="handleCategoryClick"
      )

  template(v-if="$store.state.ui.lastUsedCatsInTrnForm === 'visible' && $store.getters['categories/lastUsedCategoriesIdsByDate'].length > 0")
    .marginBottom
      .formTitle Last used categories
      CategoriesView(
        :ids="$store.getters['categories/lastUsedCategoriesIdsByDate']"
        ui="_flat"
        :noPaddingBottom="true"
        @onClick="handleCategoryClick"
      )
    .formTitle All categories

  CategoriesView(
    :ids="$store.getters['categories/categoriesRootIds']"
    :noPaddingBottom="true"
    @onClick="handleCategoryClick"
  )
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"

.marginBottom
  margin-top (- $m8)
  margin-bottom $m10
</style>
