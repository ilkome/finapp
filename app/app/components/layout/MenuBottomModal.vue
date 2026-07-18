<script setup lang="ts">
import pkg from '~~/package.json'

import { useDemo } from '~/components/demo/useDemo'
import { isSearchOpen } from '~/components/search/useSearch'
import { useUserStore } from '~/components/user/useUserStore'
import { showSuccessToast } from '~/composables/useStoreSync'

const emit = defineEmits<{ close: [] }>()
const { locale, t } = useI18n()
const userStore = useUserStore()
const { generateDemoData, isDemo } = useDemo()

function onSearchClick() {
  emit('close')
  nextTick(() => {
    isSearchOpen.value = true
  })
}

async function updateDemo() {
  await generateDemoData(locale.value)
  showSuccessToast('demo.updated')
}

// Force a fresh build: drop the workbox precache and re-check the service worker, then
// reload so the new SW + network-fetched assets take over. autoUpdate normally handles
// this, but a manual escape hatch helps when a stale cache is stuck.
async function forceUpdateCache() {
  if ('serviceWorker' in navigator)
    await navigator.serviceWorker.getRegistration().then(reg => reg?.update())
  if ('caches' in window)
    await caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  location.reload()
}
</script>

<template>
  <Teleport to="body">
    <LazyBottomSheet
      isShow
      dragClassesCustom="bottomSheetDragClassesCustom"
      @closed="emit('close')"
    >
      <template #handler>
        <BottomSheetHandler />
      </template>

      <div class="bottomSheetContent">
        <div class="bottomSheetContentInside px-3 pt-4 pb-2">
          <div
            v-if="userStore.currentUser"
            class="border-default mx-2 border-b py-2"
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
            class="grid gap-2 px-3 py-2"
          >
            <UiButtonAccent
              rounded
              @click="updateDemo"
            >
              {{ t('demo.update') }}
            </UiButtonAccent>

            <UiButtonAccent
              rounded
              variant="outline"
              @click="userStore.signOut"
            >
              {{ t('demo.exit') }}
            </UiButtonAccent>
          </div>

          <div class="grid justify-items-center gap-1 px-3 pt-2 pb-1">
            <button
              type="button"
              class="interactive text-muted flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs"
              @click="forceUpdateCache"
            >
              <Icon name="lucide:refresh-cw" size="14" />
              {{ t('app.updateCache') }}
            </button>

            <div class="text-muted text-center text-xs">
              {{ t('app.version') }} {{ pkg.version }}
            </div>
          </div>
        </div>
      </div>
    </LazyBottomSheet>
  </Teleport>
</template>
