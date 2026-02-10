<script setup lang="ts">
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const { t } = useI18n()
const trnsFormStore = useTrnsFormStore()

const desc = ref('')
watch(
  () => trnsFormStore.values.desc,
  (value) => {
    desc.value = value ?? ''
  },
  { immediate: true },
)

function onSave(close: () => void) {
  trnsFormStore.values.desc = desc.value
  close()
}
</script>

<template>
  <BottomSheetOrDropdown
    :isOpen="trnsFormStore.modal.description"
    :title="t('trnForm.description.title')"
    class="grow"
    drugClassesCustom="max-w-md"
    isShowCloseBtn
    @onCloseModal="trnsFormStore.closeTrnFormModal('description')"
    @onOpenModal="trnsFormStore.openTrnFormModal('description')"
  >
    <template #trigger>
      <TrnFormMainCalculatorButton class="relative">
        <Icon name="lucide:message-square" size="26" />
        <div
          v-if="!!trnsFormStore.values.desc"
          class="absolute top-1 right-1 aspect-square w-2 rounded-full bg-(--ui-primary)"
        />
      </TrnFormMainCalculatorButton>
    </template>

    <template #content="{ close }">
      <div class="grid min-w-80 gap-4">
        <div class="px-2">
          <FormTextarea
            :value="desc"
            :placeholder="t('trnForm.description.placeholder')"
            @updateValue="(value: string) => desc = value"
          />
        </div>

        <div class="flex-center px-2 pb-4 md:pb-0">
          <UiButtonAccent
            rounded
            @click="onSave(close)"
          >
            {{ t('base.save') }}
          </UiButtonAccent>
        </div>
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
