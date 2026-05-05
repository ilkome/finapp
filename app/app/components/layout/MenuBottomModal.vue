<script setup lang="ts">
import { useDemo } from '~/components/demo/useDemo'
import { isSearchOpen } from '~/components/search/useSearch'
import { useUserStore } from '~/components/user/useUserStore'

const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()
const userStore = useUserStore()
const { isDemo } = useDemo()

function onSearchClick() {
  emit('close')
  nextTick(() => {
    isSearchOpen.value = true
  })
}
</script>

<template>
  <Teleport to="body">
    <LazyBottomSheet
      isShow
      dragClassesCustom="bottomSheetDragClassesCustom"
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
            class="border-default mx-2 border-b pt-2 pb-2"
          >
            <UserViewLogout />
          </div>

          <div class="py-4">
            <div
              class="interactive text-muted flex min-h-[44px] items-center gap-3 rounded-sm px-2 py-1.5 md:min-h-[38px]"
              @click="onSearchClick"
            >
              <div class="flex min-w-8 items-center justify-center">
                <Icon name="lucide:search" size="22" class="leading-none" />
              </div>
              <div class="text-sm font-medium">
                {{ t('search.title') }}
              </div>
            </div>

            <LayoutSidebarMenu source="itemsModal" />
          </div>

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
