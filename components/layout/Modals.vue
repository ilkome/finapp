<script lang="ts">
export default defineComponent({
  setup() {
    const { $store } = useNuxtApp()
    const activeTab = computed(() => $store.state.ui.activeTab)

    return {
      activeTab,
    }
  },
})
</script>

<template lang="pug">
.h-0
  //- TrnForm
  BaseBottomSheet(
    keepAlive
    :show="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories'] && $store.state.trnForm.show"
    @closed="$store.dispatch('trnForm/closeTrnForm')"
  )
    template(#handler="{ close }")
      BaseBottomSheetHandler
      BaseBottomSheetClose(@onClick="close")
    TrnForm(:show="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories'] && $store.state.trnForm.show")

  //- Trn Item
  TrnsItemModal

  //- Currencies
  CurrenciesModal

  //- Loading
  template(v-if="!$store.state.app.status.ready")
    LoaderSharedLoader

  //- Notifications
  Notifications(
    :max="2"
    :position="$store.state.ui.width < 600 ? 'top center' : 'top center'"
    :width="$store.state.ui.width < 600 ? '94%' : '380px'"
    classes="notifications"
  )
</template>
