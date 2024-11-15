<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import UiToastContent from '~/components/ui/ToastContent.vue'
import { errorEmo, random } from '~/assets/js/emo'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const emit = defineEmits(['closeModal'])
const { $toast } = useNuxtApp()
const { t } = useI18n()
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
    })
    return
  }

  emit('closeModal')
}
</script>

<template>
  <div class="bg-foreground-1 grid h-full max-h-[90vh] grid-rows-[auto,1fr,auto] overflow-hidden px-2">
    <div class="px-2 py-4">
      <UiTitle>{{ t("wallets.sortTitle") }}</UiTitle>
    </div>

    <div ref="parent" class="scrollerBlock grid h-full gap-1 overflow-hidden overflow-y-auto">
      <WalletsItem
        v-for="walletId in sortedWalletsIds"
        :key="walletId"
        :walletId
        :wallet="walletsStore.itemsWithAmount[walletId]!"
        alt
        isSort
        isShowIcon
      />
    </div>

    <div class="flex-center py-2">
      <UiButtonBlue
        maxWidth
        @click="saveWalletsOrder"
      >
        {{ t("base.save") }}
      </UiButtonBlue>
    </div>
  </div>
</template>
