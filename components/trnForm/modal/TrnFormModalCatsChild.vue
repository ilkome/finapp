<script>
export default {
  computed: {
    id () {
      return this.$store.state.trnForm.showModalCategoryId
    },
    category () {
      return this.$store.state.categories.items[this.id]
    },
    childCategoriesIds () {
      return this.$store.getters['categories/getChildCategoriesIds'](this.id)
    }
  },

  methods: {
    handleCategoryClick (categoryId) {
      this.$store.commit('trnForm/closeTrnFormModal', 'categories')
      this.$store.commit('trnForm/setTrnFormValues', { categoryId })
      this.onClose()
    },

    onClose () {
      this.$store.commit('trnForm/closeTrnFormModal', 'categoriesChild')
      setTimeout(() => {
        this.$store.commit('trnForm/setTrnFormModalCategoryId', null)
      }, 100)
    }
  }
}
</script>

<template lang="pug">
TrnFormModal.doNotCloseTrnModal(
  :isShow="$store.state.trnForm.modal.categoriesChild"
  :position="$store.state.ui.mobile ? 'bottom' : null"
  :title="id && category && category.name"
  doNotTouchClassName="doNotCloseTrnModalInside"
  @onClose="onClose"
)
  template(v-if="id && category")
    CategoriesView(
      :ids="childCategoriesIds"
      :noPaddingBottom="true"
      @onClick="handleCategoryClick"
    )
</template>
