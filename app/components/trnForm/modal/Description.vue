<script setup lang="ts">
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const trnsFormStore = useTrnsFormStore()

const desc = ref('')
onMounted(() => desc.value = trnsFormStore.values.desc ?? '')

function onSave(close: () => void) {
  trnsFormStore.values.desc = desc.value
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
              v-model="desc"
              class="m-0 h-28 w-full rounded-lg border border-solid border-item-3 bg-item-4 px-4 py-3 text-base font-normal transition ease-in-out placeholder:text-item-2 focus:border-accent-2 focus:bg-item-hover focus:text-item-1 focus:outline-none"
              :placeholder="$t('trnForm.description.placeholder')"
            />
          </div>

          <div class="flex-center p-2">
            <UiButtonAccent @click="onSave(close)">
              {{ $t('base.save') }}
            </UiButtonAccent>
          </div>
        </div>
      </template>
    </BottomSheet>
  </Teleport>
</template>
