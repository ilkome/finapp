<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'
import { useAppNav } from '~/components/app/useAppNav'
import { useUserStore } from '~/components/user/useUser'

const { isModalOpen, closeAllModals } = useAppNav()
const userStore = useUserStore()
</script>

<template>
  <Teleport to="body">
    <LazyBaseBottomSheet v-if="isModalOpen('menu')" @closed="closeAllModals">
      <template #handler="{ close }">
        <BaseBottomSheetHandler />
        <BaseBottomSheetClose @onClick="close" />
      </template>

      <div :class="getStyles('modal', ['bg', 'rounded', 'padding1'])">
        <!-- User -->
        <div class="px-4 pb-2">
          <div class="text-xl font-primary font-semibold">
            {{ userStore.user?.displayName }}
          </div>
          <div class="text-sm">
            {{ userStore.user?.email }}
          </div>
        </div>

        <!-- Main Menu -->
        <LayoutMenuSidebar variant="modal" />

        <!-- Theme -->
        <div class="pt-4 px-3 pb-2">
          <AppThemeSwitcher />
        </div>
      </div>
    </LazyBaseBottomSheet>
  </Teleport>
</template>
