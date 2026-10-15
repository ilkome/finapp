<script setup lang="ts">
const props = defineProps<{
  isShowClose?: boolean
  // 'select': the transaction form's single-pick sheet. Its per-slide actions live in a toolbar
  // under the tabs (as in the stat filter), so the header keeps only the title, reset and close.
  mode?: 'filter' | 'select'
  showReset: boolean
  // Overrides the "Фильтры" title - the single-pick sheet shows the active slide's name instead.
  title?: string
}>()

const emit = defineEmits<{
  close: []
  reset: []
}>()

const isSelectMode = computed(() => props.mode === 'select')
const showClose = computed(() => props.isShowClose || isSelectMode.value)

const { t } = useI18n()
</script>

<template>
  <div class="relative">
    <UiTitleModal :hasClose="showClose">
      {{ props.title ?? t('base.filters') }}

      <template #actions>
        <UiTriggerButton
          v-if="!isSelectMode && props.showReset"
          icon="lucide:filter-x"
          :title="t('base.reset')"
          @click="emit('reset')"
        />
      </template>
    </UiTitleModal>

    <UiButtonClose v-if="showClose" @click="emit('close')" />
  </div>
</template>
