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
    <BaseBottomSheet2
      isShow
      drugClassesCustom="max-w-sm mx-auto bg-foreground-1"
      @closed="trnsFormStore.closeTrnFormModal('description')"
    >
      <template #handler="{ close }">
        <BaseBottomSheetHandler />
        <BaseBottomSheetClose @onClick="close" />
      </template>

      <template #default="{ close }">
        <div class="pt-3">
          <UiTitle
            class="px-3 pb-2 pt-1.5"
          >
            {{ $t('trnForm.description.title') }}
          </UiTitle>

          <div class="px-3 pb-6">
            <textarea
              v-model="description"
              class="text-item-base bg-item-4 border-item-5 placeholder:text-item-2 focus:text-item-1 focus:bg-item-5 focus:border-accent-4 m-0 h-28 w-full rounded-lg border border-solid px-4 py-3 text-base font-normal transition ease-in-out focus:outline-none"
              :placeholder="$t('trnForm.description.placeholder')"
            />
          </div>
          <div class="px-3 pb-4">
            <UiButtonBlue @click="onSave(close)">
              {{ $t('base.save') }}
            </UiButtonBlue>
          </div>
        </div>
      </template>
    </BaseBottomSheet2>
  </Teleport>
</template>
