<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

import { useStorage } from '@vueuse/core'
import { formatDateWithOptionalYear } from '~~/utils/date/civil'

import type { HistoryColumnFiltersState, HistoryColumnOrderState, HistoryColumnPinningState, HistoryColumnSizingState, HistoryRowSelectionState, HistorySortingState, HistoryVisibilityState, TransactionHistoryRow } from '~/components/trns/history/types'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { matchesHistoryAmount, matchesHistoryCategories, matchesHistoryDate, matchesHistoryDescription, matchesHistorySearch, matchesHistoryType, matchesHistoryWallets } from '~/components/trns/history/filters'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  columnFilters: HistoryColumnFiltersState
  globalFilter: string
  rows: TransactionHistoryRow[]
}>()

const emit = defineEmits<{
  filteredIds: [ids: string[]]
}>()

const rowSelection = defineModel<HistoryRowSelectionState>('rowSelection', { required: true })

const { t } = useI18n()
const dateLocale = useDateLocale()
const isLaptop = useIsLaptop()
const trnsStore = useTrnsStore()
const walletsStore = useWalletsStore()
const trnsFormStore = useTrnsFormStore()
const tableRef = useTemplateRef<any>('table')
const filteredCount = ref(props.rows.length)

const defaultOrder = ['select', 'date', 'type', 'categoryPath', 'walletLabel', 'description', 'amountInBase', 'actions']
const storedVisibility = useStorage<HistoryVisibilityState | null>('finapp.historyTable.columnVisibility', null)
const columnOrder = useStorage<HistoryColumnOrderState>('finapp.historyTable.columnOrder', defaultOrder)
const columnPinning = useStorage<HistoryColumnPinningState>('finapp.historyTable.columnPinning', { left: ['select'], right: ['actions'] })
const columnSizing = useStorage<HistoryColumnSizingState>('finapp.historyTable.columnSizing', {})
const sorting = useStorage<HistorySortingState>('finapp.historyTable.sorting', [{ desc: true, id: 'date' }])

const columnVisibility = computed<HistoryVisibilityState>({
  get: () => storedVisibility.value ?? (isLaptop.value
    ? {}
    : { actions: false, description: false, type: false, walletLabel: false }),
  set: (value) => { storedVisibility.value = value },
})

const sizedMeta = {
  style: {
    td: (cell: any) => ({ width: `${cell.column.getSize()}px` }),
    th: (header: any) => ({ width: `${header.column.getSize()}px` }),
  },
}

const columns = computed<TableColumn<TransactionHistoryRow>[]>(() => [
  {
    enableHiding: false,
    enableResizing: false,
    enableSorting: false,
    id: 'select',
    maxSize: 48,
    meta: { class: { td: 'w-12 px-3', th: 'w-12 px-3' } },
    size: 48,
  },
  {
    accessorKey: 'date',
    filterFn: (row, _columnId, value) => matchesHistoryDate(row.original, value),
    header: t('trns.historyTable.columns.date'),
    meta: sizedMeta,
    size: isLaptop.value ? 130 : 80,
  },
  {
    accessorKey: 'type',
    filterFn: (row, _columnId, value) => matchesHistoryType(row.original, value),
    header: t('trns.historyTable.columns.type'),
    meta: sizedMeta,
    size: 130,
  },
  {
    accessorKey: 'categoryPath',
    filterFn: (row, _columnId, value) => matchesHistoryCategories(row.original, value),
    header: t('trns.historyTable.columns.category'),
    meta: sizedMeta,
    size: isLaptop.value ? 220 : 130,
  },
  {
    accessorKey: 'walletLabel',
    filterFn: (row, _columnId, value) => matchesHistoryWallets(row.original, value),
    header: t('trns.historyTable.columns.wallet'),
    meta: sizedMeta,
    size: 210,
  },
  {
    accessorKey: 'description',
    filterFn: (row, _columnId, value) => matchesHistoryDescription(row.original, value),
    header: t('trns.historyTable.columns.description'),
    meta: sizedMeta,
    size: 260,
  },
  {
    accessorFn: row => row.amountInBase ?? undefined,
    filterFn: (row, _columnId, value) => matchesHistoryAmount(row.original, value),
    header: t('trns.historyTable.columns.amount'),
    id: 'amountInBase',
    meta: { ...sizedMeta, class: { td: 'text-right', th: 'text-right' } },
    size: isLaptop.value ? 170 : 110,
    sortingFn: (a, b) => {
      const left = a.original.amountInBase
      const right = b.original.amountInBase
      if (left === null)
        return right === null ? 0 : 1
      if (right === null)
        return -1
      return left - right
    },
    sortUndefined: 'last',
  },
  {
    enableHiding: false,
    enableResizing: false,
    enableSorting: false,
    id: 'actions',
    maxSize: 52,
    meta: { class: { td: 'w-13 px-1', th: 'w-13 px-1' } },
    size: 52,
  },
])

function getDefinitionId(column: TableColumn<TransactionHistoryRow>): string {
  if (column.id)
    return column.id
  return 'accessorKey' in column ? String(column.accessorKey) : ''
}

const hideableColumns = computed(() => columns.value.filter(column => getDefinitionId(column) !== 'select' && getDefinitionId(column) !== 'actions'))
const columnLabels = computed<Record<string, string>>(() => Object.fromEntries(columns.value.map(column => [
  getDefinitionId(column),
  typeof column.header === 'string' ? column.header : '',
])))

function moveColumn(id: string, offset: number) {
  const order = [...columnOrder.value]
  const index = order.indexOf(id)
  const target = index + offset
  if (index < 0 || target < 1 || target >= order.length - 1)
    return
  const [item] = order.splice(index, 1)
  order.splice(target, 0, item!)
  columnOrder.value = order
}

function togglePinned(id: string) {
  const left = new Set(columnPinning.value.left ?? [])
  if (left.has(id))
    left.delete(id)
  else
    left.add(id)
  left.add('select')
  columnPinning.value = { ...columnPinning.value, left: [...left] }
}

const columnMenuItems = computed(() => [
  ...hideableColumns.value.map((definition) => {
    const id = getDefinitionId(definition)
    const index = columnOrder.value.indexOf(id)
    return {
      children: [
        {
          checked: columnVisibility.value[id] !== false,
          label: t('trns.historyTable.columns.visible'),
          onUpdateChecked: (checked: boolean) => { columnVisibility.value = { ...columnVisibility.value, [id]: checked } },
          type: 'checkbox' as const,
        },
        { disabled: index <= 1, icon: 'i-lucide-arrow-left', label: t('trns.historyTable.columns.moveLeft'), onSelect: () => moveColumn(id, -1) },
        { disabled: index >= columnOrder.value.length - 2, icon: 'i-lucide-arrow-right', label: t('trns.historyTable.columns.moveRight'), onSelect: () => moveColumn(id, 1) },
        {
          checked: columnPinning.value.left?.includes(id) ?? false,
          label: t('trns.historyTable.columns.pinLeft'),
          onUpdateChecked: () => togglePinned(id),
          type: 'checkbox' as const,
        },
      ],
      label: columnLabels.value[id],
    }
  }),
  { type: 'separator' as const },
  {
    icon: 'i-lucide-rotate-ccw',
    label: t('trns.historyTable.columns.reset'),
    onSelect: () => {
      storedVisibility.value = null
      columnOrder.value = [...defaultOrder]
      columnPinning.value = { left: ['select'], right: ['actions'] }
      columnSizing.value = {}
    },
  },
])

const typeIcon: Record<TransactionHistoryRow['type'], string> = {
  adjustment: 'lucide:scale',
  expense: 'lucide:arrow-down-right',
  income: 'lucide:arrow-up-right',
  transfer: 'lucide:arrow-left-right',
}
const deleteId = ref<string | null>(null)

function typeLabel(type: TransactionHistoryRow['type']) {
  return t(`trns.historyTable.types.${type}`)
}

function rowMenuItems(row: TransactionHistoryRow) {
  return [[
    { icon: 'i-lucide-pencil', label: t('base.edit'), onSelect: () => trnsFormStore.openFormForEdit(row.id) },
    { icon: 'i-lucide-copy', label: t('base.duplicate'), onSelect: () => trnsFormStore.openFormForDuplicate(row.id) },
  ], [
    { color: 'error' as const, icon: 'i-lucide-trash-2', label: t('base.delete'), onSelect: () => { deleteId.value = row.id } },
  ]]
}

function confirmDelete() {
  if (deleteId.value)
    trnsStore.deleteTrn(deleteId.value)
  deleteId.value = null
}

function openRow(_event: Event, row: any) {
  trnsFormStore.openFormForEdit(row.original.id)
}

async function syncFilteredSelection() {
  await nextTick()
  const table = tableRef.value?.tableApi
  if (!table)
    return
  const ids = table.getFilteredRowModel().rows.map((row: any) => row.original.id as string)
  filteredCount.value = ids.length
  const allowed = new Set(ids)
  const next = Object.fromEntries(Object.entries(rowSelection.value).filter(([id, selected]) => selected && allowed.has(id)))
  if (Object.keys(next).length !== Object.keys(rowSelection.value).length)
    rowSelection.value = next
  emit('filteredIds', ids)
}

watch([() => props.rows, () => props.columnFilters, () => props.globalFilter], syncFilteredSelection, { deep: true, flush: 'post' })
onMounted(syncFilteredSelection)
</script>

<template>
  <div class="grid min-h-0 grid-rows-[auto_1fr] overflow-hidden">
    <div class="flex items-center justify-between border-b border-default px-3 py-1.5 text-sm text-muted">
      <span>{{ t('trns.historyTable.shown', { count: filteredCount }) }}</span>
      <UDropdownMenu :items="columnMenuItems" :content="{ align: 'end' }">
        <UiActionButton :ariaLabel="t('trns.historyTable.columns.settings')">
          <Icon name="lucide:columns-3-cog" size="18" />
        </UiActionButton>
      </UDropdownMenu>
    </div>

    <UTable
      ref="table"
      v-model:columnOrder="columnOrder"
      v-model:columnPinning="columnPinning"
      v-model:columnSizing="columnSizing"
      v-model:columnVisibility="columnVisibility"
      v-model:rowSelection="rowSelection"
      v-model:sorting="sorting"
      class="h-full min-h-96 overflow-auto"
      :columnFilters="props.columnFilters"
      :columns="columns"
      :data="props.rows"
      :empty="t('trns.historyTable.emptyFiltered')"
      :getRowId="row => row.id"
      :globalFilter="props.globalFilter"
      :globalFilterOptions="{ globalFilterFn: (row: any, _columnId: string, value: string) => matchesHistorySearch(row.original, value) }"
      :rowSelectionOptions="{ enableRowSelection: true }"
      sticky="header"
      :ui="{
        root: 'isolate',
        tr: 'data-[selectable=true]:cursor-pointer data-[selected=true]:bg-primary/10 hover:bg-elevated/30',
        th: 'bg-default/95 backdrop-blur',
        td: 'max-w-80 py-2.5',
      }"
      :virtualize="{ estimateSize: 56, overscan: 16 }"
      :watchOptions="{ deep: false }"
      @select="openRow"
    >
      <template #select-header="{ table }">
        <UCheckbox
          :aria-label="t('trns.historyTable.selectAll')"
          :modelValue="table.getIsSomeRowsSelected() ? 'indeterminate' : table.getIsAllRowsSelected()"
          @update:modelValue="table.toggleAllRowsSelected(!!$event)"
        />
      </template>

      <template #select-cell="{ row }">
        <UCheckbox
          :aria-label="t('trns.historyTable.selectRow')"
          :modelValue="row.getIsSelected()"
          @click.stop
          @update:modelValue="row.toggleSelected(!!$event)"
        />
      </template>

      <template v-for="id in ['date', 'type', 'categoryPath', 'walletLabel', 'description', 'amountInBase']" #[`${id}-header`]="{ column }" :key="id">
        <TrnsHistoryColumnHeader :column="column" :label="columnLabels[id] ?? id" />
      </template>

      <template #date-cell="{ row }">
        <span class="text-nowrap">{{ formatDateWithOptionalYear(row.original.date, 'd MMM', dateLocale) }}</span>
      </template>

      <template #type-cell="{ row }">
        <div class="flex items-center gap-2 text-nowrap">
          <Icon :name="typeIcon[row.original.type]" size="17" class="text-muted" />
          <span>{{ typeLabel(row.original.type) }}</span>
        </div>
      </template>

      <template #categoryPath-cell="{ row }">
        <div class="flex min-w-0 items-center gap-2">
          <UiIconBase
            :color="row.original.categoryColor"
            :name="row.original.categoryIcon"
            invert
          />
          <span class="truncate">{{ row.original.categoryPath }}</span>
        </div>
      </template>

      <template #walletLabel-cell="{ row }">
        <span class="block truncate">{{ row.original.walletLabel }}</span>
      </template>

      <template #description-cell="{ row }">
        <span v-if="row.original.description" class="block truncate">{{ row.original.description }}</span>
        <span v-else class="text-muted">{{ t('trns.historyTable.noDescription') }}</span>
      </template>

      <template #amountInBase-cell="{ row }">
        <div v-if="row.original.trn.type === TrnType.Transfer" class="grid justify-items-end gap-0.5">
          <Amount
            :amount="row.original.trn.expenseAmount"
            :currencyCode="walletsStore.items?.[row.original.trn.expenseWalletId]?.currency ?? 'USD'"
            :type="TrnType.Expense"
            variant="row"
          />
          <Amount
            :amount="row.original.trn.incomeAmount"
            :currencyCode="walletsStore.items?.[row.original.trn.incomeWalletId]?.currency ?? 'USD'"
            :type="TrnType.Income"
            variant="row"
          />
        </div>
        <Amount
          v-else
          :amount="row.original.trn.amount"
          :currencyCode="walletsStore.items?.[row.original.trn.walletId]?.currency ?? 'USD'"
          :isShowMinus="row.original.trn.type === TrnType.Expense"
          :isShowPlus="row.original.trn.type === TrnType.Income"
          :type="row.original.trn.type"
          align="right"
          colorize="income"
          variant="row"
        />
      </template>

      <template #actions-cell="{ row }">
        <UDropdownMenu :items="rowMenuItems(row.original)" :content="{ align: 'end' }">
          <button
            type="button"
            :aria-label="t('base.moreOptions')"
            class="flex size-10 items-center justify-center rounded-sm text-muted hover:bg-accented"
            @click.stop
          >
            <Icon name="lucide:ellipsis" size="17" />
          </button>
        </UDropdownMenu>
      </template>
    </UTable>

    <LayoutConfirmModal
      v-if="deleteId"
      :title="t('trnForm.delete.alert')"
      @closed="deleteId = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
