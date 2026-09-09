<script setup lang="ts">
import type { TrnId, TrnItemFull } from '~/components/trns/types'

import { filterKey } from '~/components/filter/injectionKeys'
import { statConfigKey, statDateKey, statTrnsViewStateKey } from '~/components/stat/injectionKeys'
import { useStatCategoryNavigation, useStatWalletNavigation } from '~/components/stat/navigation'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { trnsSelectionKey } from '~/components/trns/injectionKeys'
import { isTransfer, TrnType } from '~/components/trns/types'
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
const route = useRoute()
const router = useRouter()
const filter = inject(filterKey, null)
const statConfig = inject(statConfigKey, null)
const statDate = inject(statDateKey, null)
const statTrnsViewState = inject(statTrnsViewStateKey, null)
const trnsStore = useTrnsStore()
const selection = inject(trnsSelectionKey, null)
const { openFormForDuplicate, openFormForEdit } = useTrnsFormStore()

const isSelected = computed(() => selection?.has(props.trnId) ?? false)

const showDeleteConfirm = ref(false)
const reportType = computed(() => {
  if (props.trnItem.type === TrnType.Expense)
    return 'expense' as const
  if (props.trnItem.type === TrnType.Income)
    return 'income' as const
  return 'combined' as const
})
const navigationCategoriesIds = computed(() => filter?.categoriesIds.value ?? [])
const navigationWalletsIds = computed(() => filter?.walletsIds.value ?? [])
const statSnapshot = computed(() => {
  if (!statConfig || !statDate || !statTrnsViewState)
    return null

  return {
    config: statConfig.config.value,
    date: statDate.params.value,
    filteredType: reportType.value === 'combined' ? 'net' as const : reportType.value,
    reportType: reportType.value,
    trns: {
      filterBy: statTrnsViewState.filterBy.value,
      isShowHistoryWithDesc: statTrnsViewState.isShowHistoryWithDesc?.value ?? false,
      isShowWithDesc: statTrnsViewState.isShowWithDesc.value,
    },
  }
})
const openStatCategory = useStatCategoryNavigation({
  snapshot: statSnapshot,
  walletsIds: navigationWalletsIds,
})
const openStatWallet = useStatWalletNavigation({
  categoriesIds: navigationCategoriesIds,
  snapshot: statSnapshot,
})

function filterByDate(date: number) {
  if (statDate) {
    router.push({
      query: {
        ...route.query,
        customDate: `${date}`,
      },
    })
    return
  }

  router.push({
    path: '/dashboard',
    query: { customDate: `${date}` },
  })
}

function filterByCategory(categoryId: string) {
  if (statSnapshot.value)
    return openStatCategory(categoryId)

  return router.push(`/categories/${categoryId}`)
}

function filterByWallet(walletId: string) {
  if (statSnapshot.value)
    return openStatWallet(walletId)

  return router.push(`/wallets/${walletId}`)
}

const isCategoryPage = computed(() => /^\/categories\/[^/]+$/.test(route.path))
const isWalletPage = computed(() => /^\/wallets\/[^/]+$/.test(route.path))

const contextMenuItems = computed(() => {
  const trnItem = props.trnItem
  const filterItems = []

  if (!isCategoryPage.value && trnItem.categoryId !== 'transfer') {
    filterItems.push({
      icon: 'hugeicons:folder-library',
      label: t('trns.filter.byCategory'),
      onSelect: () => filterByCategory(trnItem.categoryId),
    })
  }

  if (!isWalletPage.value) {
    if (isTransfer(trnItem)) {
      const expenseWalletId = trnItem.expenseWalletId
      const incomeWalletId = trnItem.incomeWalletId
      filterItems.push({
        children: [
          {
            label: trnItem.expenseWallet.name,
            onSelect: () => filterByWallet(expenseWalletId),
          },
          {
            label: trnItem.incomeWallet.name,
            onSelect: () => filterByWallet(incomeWalletId),
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
        onSelect: () => filterByWallet(walletId),
      })
    }
  }

  filterItems.push({
    icon: 'lucide:calendar-days',
    label: t('trns.filter.byDate'),
    onSelect: () => filterByDate(trnItem.date),
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
      onSelect: () => { showDeleteConfirm.value = true },
    },
  ]]
})

// While a selection is active the row is a selection target, not a shortcut to the form.
function click() {
  if (selection?.count.value) {
    selection.toggle(props.trnId)
    return
  }

  openEdit()
}

async function openEdit() {
  emit('click')
  await nextTick()
  openFormForEdit(props.trnId)
}

async function duplicate() {
  emit('click')
  await nextTick()
  openFormForDuplicate(props.trnId)
}

function handleDeleteConfirm() {
  trnsStore.deleteTrn(props.trnId)
  showDeleteConfirm.value = false
}
</script>

<template>
  <UiContextMenuMy v-bind="$attrs" :items="contextMenuItems">
    <TrnsItem
      :compact="props.compact"
      :isActive="isSelected"
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
