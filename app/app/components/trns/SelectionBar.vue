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

const categoryEligibleCount = computed(() => selection.ids.value.filter((id) => {
  const trn = trnsStore.items?.[id]
  return trn && trn.type !== TrnType.Transfer && trn.categoryId !== 'transfer'
}).length)
const categorySkippedCount = computed(() => selection.count.value - categoryEligibleCount.value)
const walletEligibleCount = computed(() => selection.ids.value.filter((id) => {
  const trn = trnsStore.items?.[id]
  return trn && trn.type !== TrnType.Transfer
}).length)
const walletSkippedCount = computed(() => selection.count.value - walletEligibleCount.value)

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

const descriptionLabel = computed(() => {
  if (isDescriptionCleared.value)
    return t('trns.historyTable.bulk.clearDescription')
  return stagedDescription.value || t('trns.historyTable.bulk.description')
})
const categoryLabel = computed(() => (categoryId.value && categoriesStore.items?.[categoryId.value]?.name)
  || t('trns.historyTable.bulk.category'))
const walletLabel = computed(() => (walletId.value && walletsStore.items?.[walletId.value]?.name)
  || t('trns.historyTable.bulk.wallet'))

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

watch(description, (value) => {
  if (value.trim())
    isDescriptionCleared.value = false
})
</script>

<template>
  <div class="flex min-w-0 items-center gap-1 py-1">
    <UButton
      :aria-label="t('trns.historyTable.clearSelection')"
      color="neutral"
      icon="i-lucide-x"
      variant="ghost"
      @click="selection.clear()"
    />

    <div class="shrink-0 pr-1 text-sm font-medium text-highlighted">
      {{ count }}
    </div>

    <div class="-mx-1 scroll-strip flex min-w-0 grow snap-x snap-mandatory scroll-px-1 items-center gap-1 overflow-x-auto px-1">
      <BottomSheetOrDropdown
        :isOpen="isDescriptionOpen"
        :title="t('trns.historyTable.bulk.description')"
        class="shrink-0 snap-start"
        isShowCloseBtn
        @closeModal="isDescriptionOpen = false"
        @openModal="isDescriptionOpen = true"
      >
        <template #trigger="{ isActive }">
          <UButton
            class="max-w-40"
            :disabled="busy"
            icon="i-lucide-text"
            :label="descriptionLabel"
            :ui="{ label: 'truncate' }"
            :variant="isDescriptionCleared || stagedDescription ? 'soft' : (isActive ? 'soft' : 'ghost')"
          />
        </template>
        <template #content="{ close }">
          <div class="grid min-w-80 gap-3 p-3">
            <p class="text-sm text-muted">
              {{ t('trns.historyTable.bulk.willChange', { count }) }}
            </p>
            <UTextarea
              v-model="description"
              autofocus
              :placeholder="t('trns.historyTable.bulk.descriptionPlaceholder')"
              autoresize
            />
            <UButton
              block
              color="neutral"
              icon="i-lucide-eraser"
              :label="t('trns.historyTable.bulk.clearDescription')"
              variant="soft"
              @click="stageClearDescription(close)"
            />
          </div>
        </template>
      </BottomSheetOrDropdown>

      <BottomSheetOrDropdown
        :isOpen="isCategoryOpen"
        :title="t('trns.historyTable.bulk.category')"
        class="shrink-0 snap-start"
        isShowCloseBtn
        @closeModal="isCategoryOpen = false"
        @openModal="isCategoryOpen = true"
      >
        <template #trigger="{ isActive }">
          <UButton
            class="max-w-40"
            :disabled="busy || categoryEligibleCount === 0"
            icon="i-hugeicons-folder-library"
            :label="categoryLabel"
            :ui="{ label: 'truncate' }"
            :variant="categoryId ? 'soft' : (isActive ? 'soft' : 'ghost')"
          />
        </template>
        <template #custom="{ close, isExpanded }">
          <div class="grid min-w-80 grid-rows-[1fr_auto] overflow-hidden" :class="isExpanded === undefined ? 'h-[65dvh] max-h-160' : 'h-full'">
            <CategoriesSelectorModal
              autofocus
              compactDesktop
              hideCreate
              :selectedIds="categoryId ? [categoryId] : []"
              @selected="(id: CategoryId) => stageCategory(id, close)"
            />
            <div class="grid gap-2 border-t border-default bg-default p-3">
              <p class="text-sm text-muted">
                {{ t('trns.historyTable.bulk.willChange', { count: categoryEligibleCount }) }}
                <span v-if="categorySkippedCount">{{ t('trns.historyTable.bulk.transfersSkipped', { count: categorySkippedCount }) }}</span>
              </p>
              <UButton
                v-if="categoryId"
                block
                color="neutral"
                :label="t('base.reset')"
                variant="soft"
                @click="categoryId = null; close()"
              />
            </div>
          </div>
        </template>
      </BottomSheetOrDropdown>

      <BottomSheetOrDropdown
        :isOpen="isWalletOpen"
        :title="t('trns.historyTable.bulk.wallet')"
        class="shrink-0 snap-start"
        isShowCloseBtn
        @closeModal="isWalletOpen = false"
        @openModal="isWalletOpen = true"
      >
        <template #trigger="{ isActive }">
          <UButton
            class="max-w-40"
            :disabled="busy || walletEligibleCount === 0"
            icon="i-hugeicons-wallet-01"
            :label="walletLabel"
            :ui="{ label: 'truncate' }"
            :variant="walletId ? 'soft' : (isActive ? 'soft' : 'ghost')"
          />
        </template>
        <template #custom="{ close, isExpanded }">
          <div class="grid min-w-80 grid-rows-[1fr_auto] overflow-hidden" :class="isExpanded === undefined ? 'h-[65dvh] max-h-160' : 'h-full'">
            <WalletsSelector
              :activeItemId="walletId ?? undefined"
              compactDesktop
              :selectedIds="walletId ? [walletId] : []"
              withHeader
              @selected="(id: WalletId) => stageWallet(id, close)"
            />
            <div class="grid gap-2 border-t border-default bg-default p-3">
              <p class="text-sm text-muted">
                {{ t('trns.historyTable.bulk.willChange', { count: walletEligibleCount }) }}
                <span v-if="walletSkippedCount">{{ t('trns.historyTable.bulk.transfersSkipped', { count: walletSkippedCount }) }}</span>
              </p>
              <UButton
                v-if="walletId"
                block
                color="neutral"
                :label="t('base.reset')"
                variant="soft"
                @click="walletId = null; close()"
              />
            </div>
          </div>
        </template>
      </BottomSheetOrDropdown>

      <FormDate
        v-model="date"
        class="w-36 shrink-0 snap-start"
        clearable
        :placeholder="t('trns.historyTable.bulk.date')"
        :title="t('trns.historyTable.bulk.date')"
      />

      <UButton
        class="shrink-0 snap-start"
        color="error"
        :disabled="busy"
        icon="i-lucide-trash-2"
        :label="t('base.delete')"
        variant="ghost"
        @click="showDeleteConfirm = true"
      />
    </div>

    <UButton
      :disabled="!actions.length"
      :label="t('base.apply')"
      :loading="busy"
      @click="apply"
    />

    <LayoutConfirmModal
      v-if="showDeleteConfirm"
      :description="t('trns.historyTable.bulk.deleteDescription', { count })"
      :title="t('trns.historyTable.bulk.deleteTitle')"
      @closed="showDeleteConfirm = false"
      @confirm="confirmDelete"
    />
  </div>
</template>
