<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const { $store } = useNuxtApp()
const $trnForm = useTrnFormStore()

const isShowTrnForm = computed(() => $store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories'] && $store.state.trnForm.show)

function closeTrnForm() {
  $store.commit('trnForm/closeTrnForm')
  $trnForm.onClose()
}
</script>

<template lang="pug">
BaseBottomSheet2(
  keepAlive
  :isShow="isShowTrnForm"
  @closed="closeTrnForm"
)
  template(#handler="{ close }")
    BaseBottomSheetHandler
    BaseBottomSheetClose(@onClick="close")
  TrnForm
</template>
