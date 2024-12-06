<script setup lang="ts">
import { useAppNav } from '~/components/app/useAppNav'

const { closeAllModals, isModalOpen } = useAppNav()
</script>

<template>
  <Teleport to="body">
    <BottomSheet
      v-if="isModalOpen('walletsSort')"
      isShow
      drugClassesCustom="bg-foreground-1 max-w-md rounded-xl"
      @closed="closeAllModals"
    >
      <template #handler="{ close }">
        <BottomSheetHandler />
        <BottomSheetClose @onClick="close" />
      </template>

      <WalletsSort @closeModal="closeAllModals" />
    </BottomSheet>
  </Teleport>
</template>
