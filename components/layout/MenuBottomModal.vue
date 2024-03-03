<script setup lang="ts">
import { getStyles } from '~/components/ui/classes'
import { useAppNav } from '~/components/app/useAppNav'
import { useUserStore } from '~/components/user/useUser'

const { isModalOpen, closeAllModals } = useAppNav()
const userStore = useUserStore()
</script>

<template>
  <Teleport to="body">
    <LazyBaseBottomSheet v-if="isModalOpen('menu')" @closed="closeAllModals">
      <template #handler="{ close }">
        <div class="handler">
          <BaseBottomSheetClose @onClick="close" />
        </div>
      </template>

      <div :class="getStyles('modal', ['bg', 'rounded', 'padding1'])">
        <!-- User -->
        <div class="px-4 pb-2 dark_text-neutral-300">
          <div class="text-xl font-nunito font-semibold">
            {{ userStore.user?.displayName }}
          </div>
          <div class="text-sm text-gray-900 dark_text-neutral-500">
            {{ userStore.user?.email }}
          </div>
        </div>

        <!-- Main Menu -->
        <LayoutSidebarMenu variant="modal" />

        <!-- Theme -->
        <div class="pt-4 px-3 pb-2">
          <AppThemeSwitcher />
        </div>
      </div>
    </LazyBaseBottomSheet>
  </Teleport>
</template>

<style lang="stylus" scoped>
.handler
  z-index 2
  position absolute
  top 0
  left 0
  display flex
  align-items center
  justify-content center
  width 100%
  height 16px

  &:after
    content ''
    display block
    width 32px
    height 4px
    background var(--c-bg-8)
    border-radius 4px
</style>
