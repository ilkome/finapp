<script>
import CategoriesView from '@/components/categories/list/CategoriesView'
import Icon from '@/components/icon/Icon'
import TrnFormModal from '@/components/trnForm/TrnFormModal'

export default {
  components: {
    Icon,
    CategoriesView,
    TrnFormModal
  },

  computed: {
    id () {
      return this.$store.state.trnForm.showModalCategoryId
    },
    category () {
      return this.$store.state.categories.items[this.id]
    },
    childCategoriesIds () {
      return this.$store.getters.getChildCategoriesIds(this.id)
    }
  },

  methods: {
    handleCategoryClick (categoryId) {
      this.$store.commit('closeTrnFormModal', 'categories')
      this.$store.commit('closeTrnFormModal', 'categoriesChild')
      this.$store.commit('setTrnFormValues', { categoryId })
    }
  }
}
</script>

<template lang="pug">
TrnFormModal(
  :show="$store.state.trnForm.modal.categoriesChild"
  v-on:afterClose="$store.commit('setTrnFormModalCategoryId', null)"
  v-on:onClose="$store.commit('closeTrnFormModal', 'categoriesChild')"
)
  template(v-if="id && category")
    template(slot="header")
      .trnFormModal__header__back: .mdi.mdi-chevron-left
      .trnFormModal__header__title {{ category.name }}
      .trnFormModal__icon
        Icon(
          :icon="category.icon"
          :background="category.color"
          :big="true"
          :round="true"
        )

    CategoriesView(
      :ids="childCategoriesIds"
      :noPaddingBottom="true"
      v-on:onClick="handleCategoryClick"
    )
</template>
