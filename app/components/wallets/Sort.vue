<script setup lang="ts">
import type { ToastOptions } from 'vue3-toastify'
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import UiToastContent from '~/components/ui/ToastContent.vue'
import { errorEmo, random, successEmo } from '~/assets/js/emo'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const emit = defineEmits(['closeModal'])
const { $toast } = useNuxtApp()
const walletsStore = useWalletsStore()

const [parent, sortedWalletsIds] = useDragAndDrop([...walletsStore.sortedIds], {
  dragHandle: '.sortHandle',
})

async function saveWalletsOrder() {
  const result = await walletsStore.saveWalletsOrder(sortedWalletsIds.value)

  if (result !== 'ok') {
    $toast(UiToastContent, {
      autoClose: 6000,
      data: {
        description: 'Error',
        title: random(errorEmo),
      },
      type: 'error',
    } as ToastOptions)
    return
  }

  emit('closeModal')
}
</script>

<template>
  <div class="grid grid-rows-[auto,1fr,auto] overflow-hidden h-full max-h-[90vh] bg-foreground-1 px-2">
    <div class="px-2 py-4">
      <UiTitle>{{ $t("wallets.sortTitle") }}</UiTitle>
    </div>

    <div ref="parent" class="scrollerBlock overflow-hidden overflow-y-auto h-full">
      <WalletsItem
        v-for="walletId in sortedWalletsIds"
        :key="walletId"
        :walletId
        :wallet="walletsStore.sortedItems[walletId]"
        isShowIcons
        alt
        isSort
      />
    </div>

    <div class="flex-center py-2">
      <UiButtonBlue
        maxWidth
        @click="saveWalletsOrder"
      >
        {{ $t("base.save") }}
      </UiButtonBlue>
    </div>
  </div>
</template>
