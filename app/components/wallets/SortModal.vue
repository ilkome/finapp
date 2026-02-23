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
  <Teleport to="body">
    <BottomSheet
      isShow
      drugClassesCustom="bottomSheetDrugClassesCustom"
      @closed="emit('close')"
    >
      <template #handler="{ close }">
        <BottomSheetHandler />
        <BottomSheetClose @click="close" />
      </template>

      <template #default="{ close }">
        <div class="bottomSheetContent">
          <UiTitleModal>{{ t('wallets.sortTitle') }}</UiTitleModal>

          <div ref="parent" class="scrollerBlock bottomSheetContentInside">
            <WalletsItem
              v-for="walletId in sortedWalletsIds"
              :key="walletId"
              :walletId
              :wallet="walletsStore.itemsComputed[walletId]!"
              alt
              isSort
              isShowIcon
            />
          </div>

          <div class="bottomSheetContentBottom">
            <UiButtonAccent
              rounded
              @click="saveWalletsOrder(close)"
            >
              {{ t('base.save') }}
            </UiButtonAccent>
          </div>
        </div>
      </template>
    </BottomSheet>
  </Teleport>
</template>
