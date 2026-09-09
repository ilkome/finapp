<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { HistoryBulkEdit } from '~/components/trns/history/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { buildTrnsBulkEdits } from '~/components/trns/history/bulkEdits'
import { trnsSelectionKey } from '~/components/trns/injectionKeys'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { showSuccessToast } from '~/composables/useStoreSync'

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()
const walletsStore = useWalletsStore()
const selection = inject(trnsSelectionKey)!
const snapPoints = useSheetSnapPoints()
// Nested refs of an injected plain object are not unwrapped in the template.
const count = selection.count

const busy = ref(false)
const description = ref('')
const isDescriptionCleared = ref(false)
const date = ref<number | null>(null)
const categoryId = ref<CategoryId | null>(null)
const walletId = ref<WalletId | null>(null)
const isDescriptionOpen = ref(false)
const showDeleteConfirm = ref(false)
const isCategoryOpen = ref(false)
const isWalletOpen = ref(false)

// Category and wallet cannot apply to a transfer, so they leave the bar as soon as one is selected.
const hasTransfer = computed(() => selection.ids.value.some(id => trnsStore.items?.[id]?.type === TrnType.Transfer))

const stagedDescription = computed(() => description.value.trim())
const actions = computed<HistoryBulkEdit[]>(() => {
  const staged: HistoryBulkEdit[] = []

  if (isDescriptionCleared.value)
    staged.push({ type: 'clearDescription' })
  else if (stagedDescription.value)
    staged.push({ type: 'setDescription', value: stagedDescription.value })

  if (date.value !== null)
    staged.push({ type: 'setDate', value: date.value })
  if (categoryId.value)
    staged.push({ type: 'setCategory', value: categoryId.value })
  if (walletId.value)
    staged.push({ type: 'setWallet', value: walletId.value })

  return staged
})

const hasStagedDescription = computed(() => isDescriptionCleared.value || Boolean(stagedDescription.value))

function resetStaged() {
  description.value = ''
  isDescriptionCleared.value = false
  date.value = null
  categoryId.value = null
  walletId.value = null
}

function stageClearDescription(close: () => void) {
  description.value = ''
  isDescriptionCleared.value = true
  close()
}

function stageCategory(id: CategoryId, close: () => void) {
  if (!categoriesStore.isTransactible(id) || id === 'transfer')
    return

  categoryId.value = id
  close()
}

function stageWallet(id: WalletId, close: () => void) {
  if (!walletsStore.items?.[id] || walletsStore.items[id].isArchived)
    return

  walletId.value = id
  close()
}

async function apply() {
  if (busy.value || !actions.value.length || !trnsStore.items)
    return

  const result = buildTrnsBulkEdits({
    actions: actions.value,
    ids: selection.ids.value,
    isCategoryTransactible: categoriesStore.isTransactible,
    isWalletSelectable: id => Boolean(walletsStore.items?.[id] && !walletsStore.items[id].isArchived),
    items: trnsStore.items,
  })

  if (result.changedIds.length) {
    busy.value = true
    const saved = await trnsStore.saveTrns(result.values)
    busy.value = false
    if (!saved)
      return

    showSuccessToast('trns.historyTable.bulk.updated', { count: result.changedIds.length })
  }

  resetStaged()
  selection.clear()
}

async function confirmDelete() {
  if (busy.value)
    return

  const ids = [...selection.ids.value]
  busy.value = true
  const deleted = await trnsStore.deleteTrns(ids)
  busy.value = false
  showDeleteConfirm.value = false
  if (!deleted)
    return

  showSuccessToast('trns.historyTable.bulk.deleted', { count: ids.length })
  resetStaged()
  selection.clear()
}

watch(hasTransfer, (value) => {
  if (value) {
    categoryId.value = null
    walletId.value = null
  }
})

watch(description, (value) => {
  if (value.trim())
    isDescriptionCleared.value = false
})
</script>

<template>
  <div class="-mx-2 scroll-strip flex snap-x snap-mandatory scroll-px-2 items-center gap-2 overflow-x-auto px-2 py-1 lg:-mx-4 lg:scroll-px-4 lg:px-4">
    <UiActionButton
      :ariaLabel="t('trns.historyTable.clearSelection')"
      class="shrink-0 snap-start gap-1 theme-rounded-control! bg-elevated"
      variant="text"
      @click="selection.clear()"
    >
      {{ count }}
      <Icon name="lucide:x" size="18" />
    </UiActionButton>

    <UButton
      v-if="actions.length"
      class="shrink-0 snap-start"
      :label="t('base.apply')"
      :loading="busy"
      size="lg"
      @click="apply"
    />

    <BottomSheetOrDropdown
      class="flex shrink-0 grow-0 snap-start gap-1"
      :isOpen="isDescriptionOpen"
      :snapPoints="snapPoints"
      :title="t('trns.historyTable.bulk.description')"
      titleClass="pb-0!"
      isShowCloseBtn
      keyboardTrigger
      @closeModal="isDescriptionOpen = false"
      @openModal="isDescriptionOpen = true"
    >
      <template #trigger="{ isActive }">
        <UiTitleDropdown :isActive>
          <span class="text-nowrap">{{ t('trns.historyTable.bulk.description') }}</span>
          <span v-if="hasStagedDescription" class="size-1.5 rounded-full bg-primary" />
        </UiTitleDropdown>
      </template>

      <template #content="{ close }">
        <div class="grid min-w-80 gap-2 px-3 py-2 md:px-1">
          <UTextarea
            v-model="description"
            autofocus
            :placeholder="t('trns.historyTable.bulk.descriptionPlaceholder')"
            autoresize
          />
          <UiButtonAccent
            color="neutral"
            variant="soft"
            @click="stageClearDescription(close)"
          >
            {{ t('trns.historyTable.bulk.clearDescription') }}
          </UiButtonAccent>
        </div>
      </template>
    </BottomSheetOrDropdown>

    <BottomSheetOrDropdown
      v-if="!hasTransfer"
      class="flex shrink-0 grow-0 snap-start gap-1"
      :isOpen="isCategoryOpen"
      :snapPoints="snapPoints"
      :title="t('trns.historyTable.bulk.category')"
      titleClass="pb-0!"
      isShowCloseBtn
      keyboardTrigger
      @closeModal="isCategoryOpen = false"
      @openModal="isCategoryOpen = true"
    >
      <template #trigger="{ isActive }">
        <UiTitleDropdown :isActive>
          <span class="text-nowrap">{{ t('trns.historyTable.bulk.category') }}</span>
          <span v-if="categoryId" class="size-1.5 rounded-full bg-primary" />
        </UiTitleDropdown>
      </template>

      <template #custom="{ close, isExpanded }">
        <div
          class="grid min-w-80 overflow-hidden"
          :class="isExpanded === undefined ? 'h-[65dvh] max-h-160' : 'h-full'"
        >
          <CategoriesSelectorModal
            autofocus
            compactDesktop
            hideCreate
            :selectedIds="categoryId ? [categoryId] : []"
            @selected="(id: CategoryId) => stageCategory(id, close)"
          />
        </div>
      </template>
    </BottomSheetOrDropdown>

    <BottomSheetOrDropdown
      v-if="!hasTransfer"
      class="flex shrink-0 grow-0 snap-start gap-1"
      :isOpen="isWalletOpen"
      :snapPoints="snapPoints"
      :title="t('trns.historyTable.bulk.wallet')"
      titleClass="pb-0!"
      isShowCloseBtn
      keyboardTrigger
      @closeModal="isWalletOpen = false"
      @openModal="isWalletOpen = true"
    >
      <template #trigger="{ isActive }">
        <UiTitleDropdown :isActive>
          <span class="text-nowrap">{{ t('trns.historyTable.bulk.wallet') }}</span>
          <span v-if="walletId" class="size-1.5 rounded-full bg-primary" />
        </UiTitleDropdown>
      </template>

      <template #custom="{ close, isExpanded }">
        <div
          class="grid min-w-80 overflow-hidden"
          :class="isExpanded === undefined ? 'h-[65dvh] max-h-160' : 'h-full'"
        >
          <WalletsSelector
            compactDesktop
            :selectedIds="walletId ? [walletId] : []"
            withHeader
            @selected="(id: WalletId) => stageWallet(id, close)"
          />
        </div>
      </template>
    </BottomSheetOrDropdown>

    <FormDate
      v-model="date"
      class="flex shrink-0 grow-0 snap-start gap-1"
      clearable
      :placeholder="t('trns.historyTable.bulk.date')"
      :title="t('trns.historyTable.bulk.date')"
    >
      <template #trigger="{ isActive }">
        <UiTitleDropdown :isActive>
          <span class="text-nowrap">{{ t('trns.historyTable.bulk.date') }}</span>
          <span v-if="date !== null" class="size-1.5 rounded-full bg-primary" />
        </UiTitleDropdown>
      </template>
    </FormDate>

    <UButton
      class="shrink-0 snap-start"
      color="error"
      :label="t('base.delete')"
      size="lg"
      variant="soft"
      @click="showDeleteConfirm = true"
    />

    <LayoutConfirmModal
      v-if="showDeleteConfirm"
      :title="t('trns.historyTable.bulk.deleteTitle')"
      @closed="showDeleteConfirm = false"
      @confirm="confirmDelete"
    />
  </div>
</template>
