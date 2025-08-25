<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'

import { errorEmo, random } from '~/assets/js/emo'
import { useAppNav } from '~/components/app/useAppNav'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { closeAllModals, isModalOpen } = useAppNav()

const walletsStore = useWalletsStore()
const { t } = useI18n()
const toast = useToast()

const [parent, sortedWalletsIds] = useDragAndDrop([...walletsStore.sortedIds], {
  dragHandle: '.sortHandle',
})

async function saveWalletsOrder(close: () => void) {
  const result = await walletsStore.saveWalletsOrder(sortedWalletsIds.value)

  if (result !== 'ok') {
    toast.add({
      color: 'error',
      description: 'Error',
      title: random(errorEmo),
    })
    return
  }

  close()
}
</script>

<template>
  <Teleport to="body">
    <BottomSheet
      v-if="isModalOpen('walletsSort')"
      isShow
      drugClassesCustom="bottomSheetDrugClassesCustom"
      @closed="closeAllModals"
    >
      <template #handler="{ close }">
        <BottomSheetHandler />
        <BottomSheetClose @onClick="close" />
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
