<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useCategoriesStore } from '~/components/categories/useCategories'

const trnFormStore = useTrnFormStore()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()

const isShow = computed(() =>
  walletsStore.hasWallets
  && categoriesStore.hasCategories
  && trnFormStore.ui.isShow,
)
</script>

<template>
  <BaseBottomSheet2
    keepAlive
    :isShow="isShow"
    drugClassesCustom="bg-foreground-2 md_bg-transparent"
    @closed="trnFormStore.onClose()"
  >
    <template #handler="{ close }">
      <BaseBottomSheetHandler />
      <BaseBottomSheetClose @onClick="close" />
    </template>
    <TrnForm />
  </BaseBottomSheet2>
</template>
