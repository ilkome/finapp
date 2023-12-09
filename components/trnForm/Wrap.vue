<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const { $store } = useNuxtApp()
const $trnForm = useTrnFormStore()

const isShow = computed(() =>
  $store.getters['wallets/hasWallets']
  && $store.getters['categories/hasCategories']
  && $trnForm.ui.isShow,
)
</script>

<template lang="pug">
BaseBottomSheet2(
  keepAlive
  :isShow="isShow"
  @closed="$trnForm.onClose()"
)
  template(#handler="{ close }")
    BaseBottomSheetHandler
    BaseBottomSheetClose(@onClick="close")
  TrnForm
</template>
