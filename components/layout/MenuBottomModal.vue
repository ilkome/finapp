<script setup lang="ts">
import { useAppNav } from '~/components/app/useAppNav'
import { useUserStore } from '~/components/user/useUser'

const { closeAllModals, isModalOpen } = useAppNav()
const userStore = useUserStore()
</script>

<template>
  <Teleport to="body">
    <LazyBaseBottomSheet2
      v-if="isModalOpen('menu')"
      isShow
      @closed="closeAllModals"
    >
      <template #handler="{ close }">
        <BaseBottomSheetHandler />
        <BaseBottomSheetClose @onClick="close" />
      </template>

      <div class="grid gap-3 bg-foreground-3 px-1 py-3">
        <!-- User -->
        <div class="px-4 pb-2">
          <div class="text-xl font-primary font-semibold">
            {{ userStore.user?.displayName }}
          </div>
          <div class="text-sm">
            {{ userStore.user?.email }}
          </div>
        </div>

        <LayoutMenuSidebar />

        <div class="pl-2">
          <AppThemeSwitcher />
        </div>
      </div>
    </LazyBaseBottomSheet2>
  </Teleport>
</template>
