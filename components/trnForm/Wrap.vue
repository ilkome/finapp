<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useCategoriesStore } from '~/components/categories/useCategories'

const $trnForm = useTrnFormStore()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()

const isShow = computed(() =>
  walletsStore.hasWallets
  && categoriesStore.hasCategories
  && $trnForm.ui.isShow,
)
</script>

<template lang="pug">
BaseBottomSheet2(
  keepAlive
  :isShow="isShow"
  @closed="$trnForm.onClose()"
  drugClassesCustom="bg-foreground-2 md_bg-transparent"
)
  template(#handler="{ close }")
    BaseBottomSheetHandler
    BaseBottomSheetClose(@onClick="close")
  TrnForm
</template>
