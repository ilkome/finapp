<script setup lang="ts">
import { useDemo } from '~/components/demo/useDemo'
import { useSearch } from '~/components/search/useSearch'
import { useUserStore } from '~/components/user/useUserStore'

const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()
const { isSearchOpen } = useSearch()
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
          <div
            v-if="!isDemo"
            class="border-item-6 mx-2 border-b pt-2 pb-2"
          >
            <UserViewLogout />
          </div>

          <div
            class="interactive text-muted mx-2 flex min-h-[44px] items-center gap-3 rounded-sm px-2 py-1.5"
            @click="isSearchOpen = true; emit('close')"
          >
            <div class="flex min-w-8 items-center justify-center">
              <Icon name="lucide:search" size="22" />
            </div>
            <div class="text-sm font-medium">
              {{ t('search.title') }}
            </div>
          </div>

          <LayoutSidebarMenu class="py-4" />

          <div
            v-if="isDemo"
            class="px-3 py-2"
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
