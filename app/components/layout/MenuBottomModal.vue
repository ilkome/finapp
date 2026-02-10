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

      <div class="bottomSheetContent">
        <div class="bottomSheetContentInside grid gap-3 px-3 pt-4 pb-2">
          <!-- User -->
          <div
            v-if="!isDemo"
            class="mx-2"
          >
            <UserViewLogout isShowSignOut />
          </div>

          <LayoutSidebarMenu class="py-4" />

          <div
            v-if="isDemo"
            class="px-3 py-2"
            @click="userStore.signOut"
          >
            <UiButtonAccent
              rounded
              @click="userStore.signOut"
            >
              {{ t('demo.exit') }}
            </UiButtonAccent>
          </div>
        </div>
      </div>
    </LazyBottomSheet>
  </Teleport>
</template>
