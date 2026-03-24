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
    class="!grow-0 shrink-0"
    dragClassesCustom="max-w-md"
    isShowCloseBtn
    @closeModal="trnsFormStore.closeTrnFormModal('description')"
    @openModal="trnsFormStore.openTrnFormModal('description')"
  >
    <template #trigger>
      <UiActionButton class="relative overflow-visible">
        <Icon name="lucide:message-square" size="20" />
        <div
          v-if="trnsFormStore.values.desc"
          class="absolute top-0 right-0 aspect-square w-2.5 rounded-full bg-(--ui-primary)"
        />
      </UiActionButton>
    </template>

    <template #content="{ close }">
      <div class="grid min-w-80 gap-4">
        <div class="px-2">
          <FormTextarea
            v-model="desc"
            :placeholder="t('trnForm.description.placeholder')"
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
