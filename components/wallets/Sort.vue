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
    type: 'success',
  } as ToastOptions)
}
</script>

<template>
  <div class="grid grid-rows-[auto,1fr,auto] overflow-hidden h-full max-h-[95vh] bg-foreground-3">
    <!-- Header -->
    <div class="px-2 py-4">
      <UiTitle2>{{ $t("wallets.sortTitle") }}</UiTitle2>
    </div>

    <div ref="parent" class="scrollerBlock overflow-hidden overflow-y-auto h-full pr-2">
      <div
        v-for="walletId in sortedWalletsIds"
        :key="walletId"
        class="overflow-hidden my-1 flex items-center rounded-md bg-item-4 text-secondary2"
      >
        <div class="py-1 px-3 flex gap-2 items-center grow">
          <WalletsIcon
            :color="walletsStore.items[walletId].color"
            :name="walletsStore.items[walletId].name"
            :walletId
          />

          <div class="grow text-sm">
            {{ walletsStore.items[walletId].name }}
          </div>
        </div>

        <div class="sortHandle doNotCloseModal hocus_bg-item-5 px-3 py-2">
          <svg
            class="size-6"
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

    <div class="flex flex-center">
      <div class="grow max-w-xs py-3">
        <UiButtonBlue @click="saveWalletsOrder">
          {{ $t("base.save") }}
        </UiButtonBlue>
      </div>
    </div>
  </div>
</template>
