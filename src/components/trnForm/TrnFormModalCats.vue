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

  data () {
    return {
      slideTo: 0
    }
  },

  computed: {
    catsCount () {
      return this.$store.getters.categoriesRootIds.length
    },

    slidesCount () {
      if (this.catsCount > 12) return Math.ceil(this.catsCount / 12)
      return 1
    }
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
    .trnFormModal__header__title Categories
    .trnFormModal__icon
      Icon(
        icon="mdi mdi-chart-bubble"
        :big="true"
        :round="true"
        :invert="true"
      )

  //- pc
  template(v-if="$store.state.ui.pc")
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
      :autoHeight="false"
      :slideTo="slideTo"
    )
      template(v-if="$store.state.ui.lastUsedCatsInTrnForm === 'visible'")
        .swiper-slide
          CategoriesView(
            :ids="$store.getters.lastUsedCategoriesIds"
            :noPaddingBottom="true"
            v-on:onClick="handleCategoryClick"
          )

      template(v-for="index in slidesCount")
        .swiper-slide
          CategoriesView(
            :ids="$store.getters.categoriesRootIds.slice((index - 1) * 12, (index - 1) * 12 + 12)"
            :noPaddingBottom="true"
            v-on:onClick="handleCategoryClick"
          )

    .categories__desc Slide left or right
</template>
