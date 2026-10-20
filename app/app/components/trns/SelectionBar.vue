<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { TrnsBulkEdit } from '~/components/trns/bulkEdits'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { buildTrnsBulkEdits } from '~/components/trns/bulkEdits'
import { trnsSelectionKey } from '~/components/trns/injectionKeys'
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
const confirm = useConfirm()
const isCategoryOpen = ref(false)
const isWalletOpen = ref(false)

// A category cannot apply to a transfer or an adjustment, nor a single wallet to a transfer, so both leave the bar as soon as one is selected.
const hasTransfer = computed(() => selection.ids.value.some((id) => {
  const type = trnsStore.items?.[id]?.type
  return type === 'transfer' || type === 'adjustment'
}))

const stagedDescription = computed(() => description.value.trim())
const actions = computed<TrnsBulkEdit[]>(() => {
  const staged: TrnsBulkEdit[] = []

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
  if (!categoriesStore.isTransactible(id))
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

    showSuccessToast('trns.bulk.updated', { count: result.changedIds.length })
  }

  resetStaged()
  selection.clear()
}

async function confirmDelete() {
  if (busy.value || !await confirm.ask({ title: t('trns.bulk.deleteTitle') }))
    return

  const ids = [...selection.ids.value]
  busy.value = true
  const deleted = await trnsStore.deleteTrns(ids)
  busy.value = false
  if (!deleted)
    return

  showSuccessToast('trns.bulk.deleted', { count: ids.length })
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
      :ariaLabel="t('trns.selection.clear')"
      class="min-h-9! min-w-9! shrink-0 snap-start gap-1 theme-rounded-control! bg-elevated"
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

    <DrawerOrDropdown
      v-model:open="isDescriptionOpen"
      class="flex shrink-0 snap-start gap-1"
      :title="t('trns.bulk.description')"
      isShowCloseBtn
      keyboardTrigger
    >
      <template #trigger="{ isActive }">
        <UiTitleDropdown :isActive>
          <span class="text-nowrap">{{ t('trns.bulk.description') }}</span>
          <span v-if="hasStagedDescription" class="size-1.5 rounded-full bg-primary" />
        </UiTitleDropdown>
      </template>

      <template #content="{ close }">
        <FormDescriptionSheet
          v-model="description"
          isClearableWhenEmpty
          :placeholder="t('trnForm.description.placeholder')"
          @clearEmpty="stageClearDescription(close)"
        />
      </template>
    </DrawerOrDropdown>

    <DrawerOrDropdown
      v-if="!hasTransfer"
      v-model:open="isCategoryOpen"
      class="flex shrink-0 snap-start gap-1"
      :collapsedSnap="500"
      :title="t('trns.bulk.category')"
      isShowCloseBtn
      keyboardTrigger
    >
      <template #trigger="{ isActive }">
        <UiTitleDropdown :isActive>
          <span class="text-nowrap">{{ t('trns.bulk.category') }}</span>
          <span v-if="categoryId" class="size-1.5 rounded-full bg-primary" />
        </UiTitleDropdown>
      </template>

      <template #custom="{ close }">
        <div
          class="grid h-[65dvh] max-h-160 min-w-80 overflow-hidden group-data-snap/drawer:h-full group-data-snap/drawer:max-h-none"
        >
          <CategoriesSelectorModal
            autofocus
            hideCreate
            :selectedIds="categoryId ? [categoryId] : []"
            @selected="(id: CategoryId) => stageCategory(id, close)"
          />
        </div>
      </template>
    </DrawerOrDropdown>

    <DrawerOrDropdown
      v-if="!hasTransfer"
      v-model:open="isWalletOpen"
      class="flex shrink-0 snap-start gap-1"
      :collapsedSnap="500"
      :title="t('trns.bulk.wallet')"
      isShowCloseBtn
      keyboardTrigger
    >
      <template #trigger="{ isActive }">
        <UiTitleDropdown :isActive>
          <span class="text-nowrap">{{ t('trns.bulk.wallet') }}</span>
          <span v-if="walletId" class="size-1.5 rounded-full bg-primary" />
        </UiTitleDropdown>
      </template>

      <template #custom="{ close }">
        <div
          class="grid h-[65dvh] max-h-160 min-w-80 overflow-hidden group-data-snap/drawer:h-full group-data-snap/drawer:max-h-none"
        >
          <WalletsSelector
            :selectedIds="walletId ? [walletId] : []"
            withHeader
            @selected="(id: WalletId) => stageWallet(id, close)"
          />
        </div>
      </template>
    </DrawerOrDropdown>

    <FormDate
      v-model="date"
      class="flex shrink-0 snap-start gap-1"
      clearable
      :placeholder="t('trns.bulk.date')"
      :title="t('trns.bulk.date')"
    >
      <template #trigger="{ isActive }">
        <UiTitleDropdown :isActive>
          <span class="text-nowrap">{{ t('trns.bulk.date') }}</span>
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
      @click="confirmDelete"
    />
  </div>
</template>
