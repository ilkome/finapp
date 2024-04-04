<script setup lang="ts">
import { useAppNav } from '~/components/app/useAppNav'

const { closeAllModals, isModalOpen } = useAppNav()
</script>

<template>
  <Teleport to="body">
    <BaseBottomSheet2
      :isShow="isModalOpen('walletsSort')"
      drugClassesCustom="max-w-md rounded-xl px-2"
      @closed="closeAllModals"
    >
      <template #handler="{ close }">
        <BaseBottomSheetHandler />
        <BaseBottomSheetClose @onClick="close" />
      </template>

      <WalletsSort @closeModal="closeAllModals" />
    </BaseBottomSheet2>
  </Teleport>
</template>
