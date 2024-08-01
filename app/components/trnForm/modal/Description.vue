<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const trnFormStore = useTrnFormStore()

const description = ref('')
onMounted(() => description.value = trnFormStore.values.desc ?? '')

function onSave(close: () => void) {
  trnFormStore.values.desc = description.value
  close()
}
</script>

<template>
  <Teleport to="body">
    <BaseBottomSheet2
      isShow
      drugClassesCustom="max-w-sm mx-auto bg-foreground-1"
      @closed="trnFormStore.closeTrnFormModal('description')"
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

          <div class="pb-6 px-3">
            <textarea
              v-model="description"
              class="w-full h-28 m-0 py-3 px-4 rounded-lg text-base font-normal text-item-base bg-item-4 border border-solid border-item-5 placeholder:text-item-2 transition ease-in-out focus:text-item-1 focus:bg-item-5 focus:border-accent-4 focus:outline-none"
              :placeholder="$t('trnForm.description.placeholder')"
            />
          </div>
          <div class="pb-4 px-3">
            <UiButtonBlue @click="onSave(close)">
              {{ $t('base.save') }}
            </UiButtonBlue>
          </div>
        </div>
      </template>
    </BaseBottomSheet2>
  </Teleport>
</template>
