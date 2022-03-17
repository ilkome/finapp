<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

const { $store } = useNuxtApp()
const { height } = useWindowSize()

function closed() {
  $store.commit('trnForm/closeTrnFormModal', 'categories')
}
</script>

<template lang="pug">
BaseBottomSheet(
  :height="height"
  insideClass="rounded-t-2xl bg-skin-layout-main"
  @closed="closed"
)
  template(#handler="{ close }")
    BaseBottomSheetHandler
    BaseBottomSheetClose(@onClick="close")

  template(#default="{ close }")
    .h-full.overflow-hidden
      TrnFormCategories(@closeModal="close")
</template>
