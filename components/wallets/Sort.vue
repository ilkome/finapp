<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import type { ToastOptions } from 'vue3-toastify'
import UiToastContent from '~/components/ui/ToastContent.vue'
import { random, successEmo } from '~/assets/js/emo'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const emit = defineEmits(['closeModal'])
const { $toast } = useNuxtApp()
const walletsStore = useWalletsStore()

const [parent, sortedWalletsIds] = useDragAndDrop([...walletsStore.walletsSortedIds], {
  dragHandle: '.sortHandle',
})

async function saveWalletsOrder() {
  const result = await walletsStore.saveWalletsOrder(sortedWalletsIds.value)

  if (result !== 'ok')
    return

  emit('closeModal')
  $toast(UiToastContent, {
    data: {
      title: random(successEmo),
      description: 'Saved',
    },
    autoClose: 6000,
    type: 'error',
  } as ToastOptions)
}
</script>

<template>
  <div class="overflow h-full overflow-x-auto bg-foreground-3">
    <!-- Header -->
    <div
      class="text-item-base px-2 pb-4 text-center font-primary text-xl font-semibold"
    >
      {{ $t("wallets.sortTitle") }}
    </div>

    <div ref="parent" class="grid gap-1">
      <div
        v-for="walletId in sortedWalletsIds"
        :key="walletId"
        class="flex items-center gap-3 overflow-hidden rounded-md bg-item-4 py-0 pl-3"
      >
        <div class="flex-center grow gap-x-3">
          <div
            class="flex-center h-6 w-6 rounded-md text-xs leading-none text-neutral-50 mt-[2px]"
            :style="{ background: walletsStore.items[walletId].color }"
          >
            {{ walletsStore.items[walletId].name.substring(0, 2) }}
          </div>
          <div class="grow text-sm text-neutral-500 dark_text-neutral-400">
            {{ walletsStore.items[walletId].name }}
          </div>
          <div
            class="flex-center sortHandle doNotCloseModal h-11 w-11 cursor-grab hocus_bg-item-5"
          >
            <svg
              class="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2s.9-2 2-2s2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-center pt-6">
      <UiButtonBlue class="maxWidth" @click="saveWalletsOrder">
        {{ $t("base.save") }}
      </UiButtonBlue>
    </div>
  </div>
</template>
