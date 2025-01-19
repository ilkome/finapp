<script setup lang="ts">
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const { t } = useI18n()
const trnsFormStore = useTrnsFormStore()

const desc = ref('')
onMounted(() => desc.value = trnsFormStore.values.desc ?? '')

function onSave(close: () => void) {
  trnsFormStore.values.desc = desc.value
  close()
}
</script>

<template>
  <BottomSheetOrDropdown
    :title="t('trnForm.description.title')"
    :isOpen="trnsFormStore.modal.description"
    class="grow"
    placement="bottom-end"
    drugClassesCustom="max-w-md"
    @onOpenModal="trnsFormStore.openTrnFormModal('description')"
    @onCloseModal="trnsFormStore.closeTrnFormModal('description')"
  >
    <template #trigger>
      <TrnFormMainCalculatorButton class="relative">
        <Icon name="lucide:message-square" size="26" />
        <div
          v-if="!!trnsFormStore.values.desc"
          class="absolute right-1 top-1 aspect-square w-2 rounded-full bg-accent-1"
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
