<script setup lang="ts">
import { useAppNav } from '~/components/app/useAppNav'

const { closeAllModals, isModalOpen } = useAppNav()
</script>

<template>
  <Teleport to="body">
    <div class="_max-w-sm">
      <BaseBottomSheet2
        :isShow="isModalOpen('walletsSort')"
        keepAlive
        drugClassesCustom="max-w-md rounded-xl"
        @closed="closeAllModals"
      >
        <template #handler="{ close }">
          <BaseBottomSheetHandler />
          <BaseBottomSheetClose @onClick="close" />
        </template>

        <WalletsSort @closeModal="closeAllModals" />
      </BaseBottomSheet2>
    </div>
  </Teleport>
</template>
