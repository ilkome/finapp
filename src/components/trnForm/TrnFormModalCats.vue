<script>
import Icon from '@/components/icon/Icon'
import CategoriesView from '@/components/categories/list/CategoriesView'
import TrnFormModal from '@/components/trnForm/TrnFormModal'
import Slider from '@/components/slider/Slider'

export default {
  components: {
    Icon,
    CategoriesView,
    TrnFormModal,
    Slider
  },

  methods: {
    handleCategoryClick (categoryId) {
      if (this.$store.getters.getChildCategoriesIds(categoryId).length > 0) {
        this.$store.commit('setTrnFormModalCategoryId', categoryId)
        this.$store.commit('showTrnFormModal', 'categoriesChild')
      } else {
        this.$store.commit('closeTrnFormModal', 'categories')
        this.$store.commit('closeTrnFormModal', 'categoriesChild')
        this.$store.commit('setTrnFormValues', { categoryId })
      }
    }
  }
}
</script>

<template lang="pug">
TrnFormModal(
  :show="$store.state.trnForm.modal.categories"
  v-on:onClose="$store.commit('toogleTrnFormModal', 'categories')"
)
  template(slot="header")
    .trnFormModal__header__back: .mdi.mdi-chevron-left
    .trnFormModal__header__title  {{ $lang.categories.name }}
    .trnFormModal__icon
      Icon(
        icon="mdi mdi-chart-bubble"
        :big="true"
        :round="true"
        :invert="true"
      )

  //- pc
  template(v-if="$store.state.ui.pc")
    template(v-if="$store.state.ui.lastUsedCatsInTrnForm === 'visible'")
      .marginBottom
        .formTitle Last used categories
        CategoriesView(
          :ids="$store.getters.lastUsedCategoriesIdsByDate"
          :noPaddingBottom="true"
          v-on:onClick="handleCategoryClick"
        )

    template(v-if="$store.state.ui.lastUsedCatsInTrnForm === 'visible'")
      .formTitle All categories
    CategoriesView(
      :ids="$store.getters.categoriesRootIds"
      :noPaddingBottom="true"
      v-on:onClick="handleCategoryClick"
    )

  //- mobile
  template(v-if="$store.state.ui.mobile")
    Slider(
      :slidesPerColumn="1"
      :slidesPerView="1"
      :autoHeight="true")
      template(v-if="$store.state.ui.lastUsedCatsInTrnForm === 'visible'")
        template(v-if="$store.getters.lastUsedCategoriesIdsByDate.length > 0")
          .swiper-slide
            CategoriesView(
              :ids="$store.getters.lastUsedCategoriesIdsByDate"
              :noPaddingBottom="true"
              v-on:onClick="handleCategoryClick")

      .swiper-slide
        CategoriesView(
          :ids="$store.getters.categoriesRootIds"
          :noPaddingBottom="true"
          v-on:onClick="handleCategoryClick")
</template>

<style lang="stylus" scoped>
.marginBottom
  margin-bottom 30px
</style>
