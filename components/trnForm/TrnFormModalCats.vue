<script>
export default {
  computed: {
    show () {
      return this.$store.state.trnForm.modal.categories
    }
  }
}
</script>

<template lang="pug">
TrnFormModal(
  v-if="$store.state.trnForm.modal.categories"
  :show="$store.state.trnForm.modal.categories"
  :title="$t('categories.name')"
  :position="$store.state.ui.mobile ? 'bottom' : null"
  noPadding
  @onClose="$store.commit('trnForm/toogleTrnFormModal', 'categories')"
)
  TrnFormCategories(:show="show")
</template>
