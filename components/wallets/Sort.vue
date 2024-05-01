<script setup lang="ts">
import type { ToastOptions } from 'vue3-toastify'
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import UiToastContent from '~/components/ui/ToastContent.vue'
import { random, successEmo } from '~/assets/js/emo'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const emit = defineEmits(['closeModal'])
const { $toast } = useNuxtApp()
const walletsStore = useWalletsStore()

const [parent, sortedWalletsIds] = useDragAndDrop([...walletsStore.sortedIds], {
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
  <div class="grid grid-rows-[auto,1fr,auto] overflow-hidden h-full max-h-[90vh] bg-foreground-3">
    <!-- Header -->
    <div class="px-2 py-4">
      <UiTitle2>{{ $t("wallets.sortTitle") }}</UiTitle2>
    </div>

    <div ref="parent" class="grid gap-1 scrollerBlock overflow-hidden overflow-y-auto h-full px-2">
      <WalletsItem
        v-for="walletId in sortedWalletsIds"
        :key="walletId"
        :walletId
        :wallet="walletsStore.sortedItems[walletId]"
        isShowIcons
      />
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
