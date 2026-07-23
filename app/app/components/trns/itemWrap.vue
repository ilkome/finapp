<script setup lang="ts">
import type { TrnId, TrnItemFull } from '~/components/trns/types'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  compact?: boolean
  date?: string
  isSelected?: boolean
  selectable?: boolean
  trnId: TrnId
  trnItem: TrnItemFull
}>()

const emit = defineEmits<{
  click: []
  toggleSelect: []
}>()

const { t } = useI18n()
const trnsStore = useTrnsStore()
const { openFormForDuplicate, openFormForEdit } = useTrnsFormStore()

const showDeleteConfirm = ref(false)

const contextMenuItems = computed(() => [[
  {
    icon: 'lucide:pencil',
    label: t('base.edit'),
    onSelect: () => click(),
  },
  {
    icon: 'lucide:copy',
    label: t('base.duplicate'),
    onSelect: () => openFormForDuplicate(props.trnId),
  },
], [
  {
    color: 'error' as const,
    icon: 'lucide:trash-2',
    label: t('base.delete'),
    onSelect: () => { showDeleteConfirm.value = true },
  },
]])

function click() {
  emit('click')
  openFormForEdit(props.trnId)
}

function handleDeleteConfirm() {
  trnsStore.deleteTrn(props.trnId)
  showDeleteConfirm.value = false
}
</script>

<template>
  <div
    v-if="selectable"
    v-bind="$attrs"
    class="flex items-center gap-2 pl-3"
    @click="emit('toggleSelect')"
  >
    <input
      type="checkbox"
      :checked="isSelected"
      class="pointer-events-none size-5 shrink-0"
    >
    <TrnsItem
      :compact="props.compact"
      :trnItem
      :date
      class="grow"
    />
  </div>

  <template v-else>
    <UiContextMenuMy v-bind="$attrs" :items="contextMenuItems">
      <TrnsItem
        :compact="props.compact"
        :trnItem
        :date
        @click="click"
      />
    </UiContextMenuMy>

    <LayoutConfirmModal
      v-if="showDeleteConfirm"
      :title="t('trnForm.delete.alert')"
      @closed="showDeleteConfirm = false"
      @confirm="handleDeleteConfirm"
    />
  </template>
</template>
