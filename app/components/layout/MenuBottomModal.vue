<script setup lang="ts">
import { useAppNav } from '~/components/app/useAppNav'
import { useDemo } from '~/components/demo/useDemo'
import { useUserStore } from '~/components/user/useUserStore'

const { closeAllModals, isModalOpen } = useAppNav()
const { t } = useI18n()
const userStore = useUserStore()
const { isDemo } = useDemo()
</script>

<template>
  <Teleport to="body">
    <LazyBottomSheet
      v-if="isModalOpen('menu')"
      isShow
      @closed="closeAllModals"
    >
      <template #handler="{ close }">
        <BottomSheetHandler />
        <BottomSheetClose @onClick="close" />
      </template>

      <div class="bg-foreground-1 grid gap-3 px-1 py-3">
        <LayoutSidebarMenu />

        <div class="pl-2 pt-2">
          <AppThemeSwitcherSelect isShowTitle />
        </div>

        <!-- User -->
        <div
          v-if="!isDemo"
          class="border-item-6 border-t px-2 pt-3"
        >
          <UserViewLogout />
        </div>

        <div
          v-if="isDemo"
          class="px-3 py-2"
          @click="userStore.signOut"
        >
          <UiButtonAccent
            rounded
            @click="userStore.signOut"
          >
            {{ t("demo.exit") }}
          </UiButtonAccent>
        </div>
      </div>
    </LazyBottomSheet>
  </Teleport>
</template>
