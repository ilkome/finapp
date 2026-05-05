<script setup lang="ts">
import type { TrnId, TrnItemFull } from '~/components/trns/types'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  compact?: boolean
  date?: string
  trnId: TrnId
  trnItem: TrnItemFull
}>()

const emit = defineEmits<{
  click: []
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
  <UContextMenu v-bind="$attrs" :items="contextMenuItems">
    <TrnsItem
      :compact="props.compact"
      :trnItem
      :date
      @click="click"
    />
  </UContextMenu>

  <LayoutConfirmModal
    v-if="showDeleteConfirm"
    :title="t('trnForm.delete.alert')"
    @closed="showDeleteConfirm = false"
    @confirm="handleDeleteConfirm"
  />
</template>
