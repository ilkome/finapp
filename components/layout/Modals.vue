<script lang="ts">
import { computed, useNuxtApp, defineComponent } from '#app'

export default defineComponent({
  setup () {
    const { $store } = useNuxtApp()
    const activeTab = computed(() => $store.state.ui.activeTab)

    return {
      activeTab
    }
  }
})
</script>

<template lang="pug">
.h-0
  //- trn: form
  BaseBottomSheet(
    keepAlive
    :show="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories'] && $store.state.trnForm.show"
    @closed="$store.dispatch('trnForm/closeTrnForm')"
  )
    template(#handler="{ close }")
      BaseBottomSheetHandler
      BaseBottomSheetClose(@onClick="close")
    TrnForm(:show="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories'] && $store.state.trnForm.show")

  //- trn: item
  TrnsModal

  //- menu
  LazyLayoutMenuModal(v-if="activeTab === 'menu'")

  //- currencies
  CurrenciesModal

  //- category: item
  CategoriesModal

  //- category: create or edit
  LazyCategoriesEditModal(v-if="activeTab === 'createCategory'")

  //- settings
  Portal(v-if="activeTab === 'settings'" to="modal")
    ModalBottom(@onClose="$store.dispatch('ui/setActiveTab', null)")
      Settings(v-if="activeTab === 'settings'")

  //- wallet item
  WalletsModal

  //- wallet: create or edit
  Portal(v-if="activeTab === 'createWallet'" to="modal")
    ModalBottom(
      :key="$store.state.wallets.editId"
      @onClose="$store.dispatch('ui/setActiveTab', null)"
    )
      WalletsFormWalletForm(
        @callback="$store.dispatch('ui/setActiveTab', null)"
      )

  //- wallet: sort
  Portal(v-if="activeTab === 'walletsSort'" to="modal" key="walletsSort")
    ModalBottom(
      isShow
      key="walletsSort"
      @onClose="$store.dispatch('ui/setActiveTab', null)"
    )
      template(#default="{ closeModal }")
        WalletsSort(
          v-if="activeTab === 'walletsSort'"
          @closeModal="closeModal"
        )

  //- loading
  template(v-if="!$store.state.app.status.ready")
    LoaderSharedLoader

  //- notifications
  Notifications(
    :max="2"
    :position="$store.state.ui.width < 600 ? 'top center' : 'top center'"
    :width="$store.state.ui.width < 600 ? '94%' : '380px'"
    classes="notifications"
  )
</template>
