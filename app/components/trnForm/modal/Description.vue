<script setup lang="ts">
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const trnsFormStore = useTrnsFormStore()

const description = ref('')
onMounted(() => description.value = trnsFormStore.values.desc ?? '')

function onSave(close: () => void) {
  trnsFormStore.values.desc = description.value
  close()
}
</script>

<template>
  <Teleport to="body">
    <BottomSheet
      isShow
      drugClassesCustom="bottomSheetDrugClassesCustom"
      @closed="trnsFormStore.closeTrnFormModal('description')"
    >
      <template #handler="{ close }">
        <BottomSheetHandler />
        <BottomSheetClose @onClick="close" />
      </template>

      <template #default="{ close }">
        <div class="bottomSheetContent">
          <UiTitleModal>{{ $t('trnForm.description.title') }}</UiTitleModal>

          <div class="px-2">
            <textarea
              v-model="description"
              class="text-item-base bg-item-4 border-item-5 placeholder:text-item-2 focus:text-item-1 focus:bg-item-5 focus:border-accent-4 m-0 h-28 w-full rounded-lg border border-solid px-4 py-3 text-base font-normal transition ease-in-out focus:outline-none"
              :placeholder="$t('trnForm.description.placeholder')"
            />
          </div>

          <div class="flex-center p-2">
            <UiButtonBlue @click="onSave(close)">
              {{ $t('base.save') }}
            </UiButtonBlue>
          </div>
        </div>
      </template>
    </BottomSheet>
  </Teleport>
</template>
