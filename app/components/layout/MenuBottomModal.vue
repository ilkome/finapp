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
        <!-- User -->
        <div
          v-if="userStore.user"
          class="px-4 pb-2"
        >
          <div class="font-primary text-xl font-semibold">
            {{ userStore.user?.displayName }}
          </div>
          <div class="text-sm">
            {{ userStore.user?.email }}
          </div>
        </div>

        <LayoutMenuSidebar />

        <div class="pl-2">
          <AppThemeSwitcher isShowSystem />
        </div>

        <div
          v-if="isDemo"
          class="px-3 py-2"
          @click="userStore.signOut"
        >
          <UiButtonBlue @click="userStore.signOut">
            {{ t("demo.exit") }}
          </UiButtonBlue>
        </div>
      </div>
    </LazyBottomSheet>
  </Teleport>
</template>
