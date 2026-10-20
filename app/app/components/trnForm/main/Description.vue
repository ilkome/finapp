<script setup lang="ts">
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const { t } = useI18n()
const trnsFormStore = useTrnsFormStore()

// Written straight into the form: the sheet has no save button, closing it keeps the text.
const desc = computed({
  get: () => trnsFormStore.values.description ?? '',
  set: (value: string) => { trnsFormStore.values.description = value },
})
</script>

<template>
  <DrawerOrDropdown
    :open="trnsFormStore.modal.description"
    :title="t('trnForm.description.title')"
    class="shrink-0"
    isShowCloseBtn
    @update:open="value => value ? trnsFormStore.openTrnFormModal('description') : trnsFormStore.closeTrnFormModal('description')"
  >
    <template #trigger>
      <UiActionButton class="relative overflow-visible">
        <Icon name="lucide:message-square" size="20" />
        <div
          v-if="trnsFormStore.values.description"
          class="absolute top-0 right-0 aspect-square w-2.5 rounded-full bg-primary"
        />
      </UiActionButton>
    </template>

    <template #content>
      <FormDescriptionSheet
        v-model="desc"
        :placeholder="t('trnForm.description.placeholder')"
      />
    </template>
  </DrawerOrDropdown>
</template>
