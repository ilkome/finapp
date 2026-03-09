<script setup lang="ts">
import { useDemo } from '~/components/demo/useDemo'
import { useUserStore } from '~/components/user/useUserStore'

const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()
const userStore = useUserStore()
const { isDemo } = useDemo()
</script>

<template>
  <Teleport to="body">
    <LazyBottomSheet
      isShow
      @closed="emit('close')"
    >
      <template #handler="{ close }">
        <BottomSheetHandler />
        <BottomSheetClose @click="close" />
      </template>

      <div class="bottomSheetContent">
        <div class="bottomSheetContentInside px-3 pt-4 pb-2">
          <!-- User -->
          <div
            v-if="!isDemo"
            class="border-item-6 mx-2 border-b pt-2 pb-2"
          >
            <UserViewLogout />
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
