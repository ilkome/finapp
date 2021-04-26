<script>
import { computed, useContext } from '@nuxtjs/composition-api'

export default {
  name: 'TrnFormModalCats',

  setup () {
    const { store } = useContext()
    const isShow = computed(() => store.state.trnForm.modal.categories)

    return {
      isShow
    }
  }
}
</script>

<template lang="pug">
TrnFormModal.doNotCloseTrnModal(
  :isShow="isShow"
  :title="$t('categories.name')"
  @onClose="$store.commit('trnForm/closeTrnFormModal', 'categories')"
  noPadding
)
  TrnFormCategories(:show="isShow")
</template>
