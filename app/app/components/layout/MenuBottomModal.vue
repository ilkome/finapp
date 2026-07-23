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
const config = useRuntimeConfig()

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

async function clearCachesAndReload() {
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
              class="interactive text-muted flex min-h-11 items-center gap-3 rounded-sm px-2 py-1.5 md:min-h-9.5"
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

          <div
            v-if="!config.public.isProd"
            class="grid justify-items-center gap-1 px-3 pt-2 pb-1"
          >
            <UButton
              :label="t('app.updateCache')"
              class="text-muted"
              color="neutral"
              icon="lucide:refresh-cw"
              size="xs"
              variant="ghost"
              @click="clearCachesAndReload"
            />

            <div class="text-muted text-center text-xs">
              {{ t('app.version') }} {{ pkg.version }}
            </div>
          </div>
        </div>
      </div>
    </LazyBottomSheet>
  </Teleport>
</template>
