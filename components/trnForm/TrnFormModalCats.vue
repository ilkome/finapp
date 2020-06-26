<script>
import Icon from '~/components/icon/Icon'
import CategoriesView from '~/components/categories/list/CategoriesView'
import TrnFormModal from '~/components/trnForm/TrnFormModal'
import Slider from '~/components/slider/Slider'

export default {
  components: {
    Icon,
    CategoriesView,
    TrnFormModal,
    Slider
  },

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
TrnFormModal(
  :show="$store.state.trnForm.modal.categories"
  v-on:onClose="$store.commit('trnForm/toogleTrnFormModal', 'categories')"
)
  template(slot="header")
    .trnFormModal__header__back: .mdi.mdi-chevron-left
    .trnFormModal__header__title  {{ $lang.categories.name }}

  //- pc
  template(v-if="$store.state.ui.lastUsedCatsInTrnForm === 'visible'")
    .marginBottom
      .formTitle Last used categories
      CategoriesView(
        :ids="$store.getters['categories/lastUsedCategoriesIdsByDate']"
        :noPaddingBottom="true"
        v-on:onClick="handleCategoryClick"
      )

  template(v-if="$store.state.ui.lastUsedCatsInTrnForm === 'visible'")
    .formTitle All categories
  CategoriesView(
    :ids="$store.getters['categories/categoriesRootIds']"
    :noPaddingBottom="true"
    v-on:onClick="handleCategoryClick"
  )
</template>

<style lang="stylus" scoped>
.marginBottom
  margin-bottom 30px
</style>
