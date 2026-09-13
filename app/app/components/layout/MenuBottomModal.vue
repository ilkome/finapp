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
      dragClassesCustom="bottom-sheet-drag-classes-custom"
      @closed="emit('close')"
    >
      <template #handler>
        <BottomSheetHandler />
      </template>

      <div class="bottom-sheet-content">
        <div class="bottom-sheet-content-inside overflow-y-hidden! p-0!">
          <div class="h-full max-h-[98dvh] scroller-block overflow-y-auto px-3 pt-4 pb-2">
            <LayoutUserMenuPanels @close="emit('close')">
              <template #root>
                <div
                  class="flex min-h-11 items-center gap-3 rounded-sm interactive px-2 py-1.5 text-muted"
                  @click="onSearchClick"
                >
                  <div class="flex min-w-7 items-center justify-center">
                    <Icon name="lucide:search" size="22" class="leading-none" />
                  </div>
                  <div class="text-sm font-medium">
                    {{ t('search.title') }}
                  </div>
                </div>

                <LayoutSidebarMenu source="itemsModal" />

                <div aria-hidden="true" class="mx-2 my-1 h-px bg-elevated/50" />
              </template>

              <template #rootAfter>
                <div v-if="isDemo" class="grid gap-2 px-3 py-2">
                  <UiButtonAccent @click="updateDemo">
                    {{ t('demo.update') }}
                  </UiButtonAccent>

                  <UiButtonAccent variant="outline" @click="userStore.signOut">
                    {{ t('demo.exit') }}
                  </UiButtonAccent>
                </div>

                <div v-if="!config.public.isProd" class="grid justify-items-center gap-1 px-3 pt-2 pb-1">
                  <UButton
                    :label="t('app.updateCache')"
                    class="text-muted"
                    color="neutral"
                    icon="lucide:refresh-cw"
                    size="xs"
                    variant="ghost"
                    @click="clearCachesAndReload"
                  />

                  <div class="text-center text-xs text-muted">
                    {{ t('app.version') }} {{ pkg.version }}
                  </div>
                </div>
              </template>
            </LayoutUserMenuPanels>
          </div>
        </div>
      </div>
    </LazyBottomSheet>
  </Teleport>
</template>
