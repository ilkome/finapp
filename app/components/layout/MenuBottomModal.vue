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

      <div class="grid gap-3 bg-item-1 px-1 py-3">
        <!-- User -->
        <div
          v-if="!isDemo"
          class="mx-2"
        >
          <UserViewLogout isShowSignOut />
        </div>

        <LayoutSidebarMenu class="py-4" />

        <div class="pl-2 pt-2">
          <AppThemeSwitcher isShowTitle />
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
