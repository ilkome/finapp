<script setup lang="ts">
import type { TrnId, TrnItemFull } from '~/components/trns/types'

import { trnsSelectionKey } from '~/components/trns/injectionKeys'
import { isTransfer } from '~/components/trns/types'
import { useTrnActions } from '~/components/trns/useTrnActions'
import { useFeature } from '~/composables/useFeatures'

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
const selection = inject(trnsSelectionKey, null)
const actions = useTrnActions()
const isPreviewFeature = useFeature('trnPreview')
const isShowPreview = ref(false)

const isSelected = computed(() => selection?.has(props.trnId) ?? false)

const contextMenuItems = computed(() => {
  const trnItem = props.trnItem
  const filterItems = []

  if (actions.canFilterCategory(trnItem)) {
    filterItems.push({
      icon: 'hugeicons:folder-library',
      label: t('trns.filter.byCategory'),
      onSelect: () => actions.filterByCategory(trnItem.categoryId),
    })
  }

  if (!actions.isWalletPage.value) {
    if (isTransfer(trnItem)) {
      const expenseWalletId = trnItem.expenseWalletId
      const incomeWalletId = trnItem.incomeWalletId
      filterItems.push({
        children: [
          {
            label: trnItem.expenseWallet.name,
            onSelect: () => actions.filterByWallet(expenseWalletId),
          },
          {
            label: trnItem.incomeWallet.name,
            onSelect: () => actions.filterByWallet(incomeWalletId),
          },
        ],
        icon: 'hugeicons:wallet-01',
        label: t('trns.filter.byWallet'),
      })
    }
    else {
      const walletId = trnItem.walletId
      filterItems.push({
        icon: 'hugeicons:wallet-01',
        label: t('trns.filter.byWallet'),
        onSelect: () => actions.filterByWallet(walletId),
      })
    }
  }

  filterItems.push({
    icon: 'lucide:calendar-days',
    label: t('trns.filter.byDate'),
    onSelect: () => actions.filterByDate(trnItem.date),
  })

  return [[
    ...(selection
      ? [{
          icon: isSelected.value ? 'lucide:square-minus' : 'lucide:square-check',
          label: isSelected.value ? t('trns.selection.deselect') : t('trns.selection.select'),
          onSelect: () => selection.toggle(props.trnId),
        }]
      : []),
    {
      icon: 'lucide:pencil',
      label: t('base.edit'),
      onSelect: () => openEdit(),
    },
    {
      icon: 'lucide:copy',
      label: t('base.duplicate'),
      onSelect: () => duplicate(),
    },
  ], filterItems, [
    {
      color: 'error' as const,
      icon: 'lucide:trash-2',
      label: t('base.delete'),
      onSelect: () => actions.deleteWithConfirm(props.trnId),
    },
  ]]
})

// While a selection is active the row is a selection target, not a shortcut to the preview or form.
function click() {
  if (selection?.count.value) {
    selection.toggle(props.trnId)
    return
  }

  if (isPreviewFeature.value) {
    isShowPreview.value = true
    return
  }

  openEdit()
}

async function openEdit() {
  emit('click')
  await nextTick()
  actions.edit(props.trnId)
}

async function duplicate() {
  emit('click')
  await nextTick()
  actions.duplicate(props.trnId)
}
</script>

<template>
  <UiContextMenuMy v-bind="$attrs" :items="contextMenuItems">
    <TrnsItem
      :compact="props.compact"
      :isActive="isSelected || isShowPreview"
      :trnItem
      :date
      @click="click"
    />
  </UiContextMenuMy>

  <TrnsPreviewSection
    v-if="isShowPreview"
    :trnId="props.trnId"
    :trnItem="props.trnItem"
    @closed="isShowPreview = false"
    @leave="emit('click')"
  />
</template>
