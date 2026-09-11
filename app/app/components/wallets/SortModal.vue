<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'

import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const emit = defineEmits<{ close: [] }>()

const walletsStore = useWalletsStore()
const { t } = useI18n()

const [parent, sortedWalletsIds] = useDragAndDrop([...walletsStore.sortedIds], {
  dragHandle: '.sortHandle',
})

function saveWalletsOrder(close: () => void) {
  walletsStore.saveWalletsOrder(sortedWalletsIds.value)
  close()
}
</script>

<template>
  <BottomSheetModal @closed="emit('close')">
    <template #default="{ close }">
      <UiTitleModal>{{ t('wallets.sortTitle') }}</UiTitleModal>

      <div class="relative min-h-0">
        <div ref="parent" class="bottom-sheet-content-inside scroller-block pb-20">
          <WalletsItem
            v-for="walletId in sortedWalletsIds"
            :key="walletId"
            :walletId
            :wallet="walletsStore.itemsComputed[walletId]!"
            compact
            isSort
            isShowIcon
          />
        </div>

        <div class="absolute inset-x-0 bottom-0 z-10 flex items-center gap-2 px-3 py-2">
          <div
            class="pointer-events-none absolute inset-x-0 -top-6 bottom-0 -z-10"
            style="background: linear-gradient(to bottom, transparent, var(--ui-bg))"
          />

          <div class="min-w-0 flex-1">
            <UiButtonAccent
              size="xl"
              @click="saveWalletsOrder(close)"
            >
              {{ t('base.save') }}
            </UiButtonAccent>
          </div>
        </div>
      </div>
    </template>
  </BottomSheetModal>
</template>
