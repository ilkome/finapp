<script>
export default {
  computed: {
    isShow () {
      return this.$store.state.trnForm.modal.categories
    }
  }
}
</script>

<template lang="pug">
TrnFormModal.doNotCloseTrnModal(
  :isShow="isShow"
  :position="$store.state.ui.mobile ? 'bottom' : null"
  :title="$t('categories.name')"
  @onClose="$store.commit('trnForm/toogleTrnFormModal', 'categories')"
  noPadding
)
  TrnFormCategories(:show="isShow")
</template>
