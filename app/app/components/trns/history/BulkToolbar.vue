<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { HistoryBulkEdit } from '~/components/trns/history/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { buildHistoryBulkEdit } from '~/components/trns/history/bulkEdits'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { showSuccessToast } from '~/composables/useStoreSync'

const props = defineProps<{
  filteredCount: number
  selectedIds: string[]
}>()

const emit = defineEmits<{
  applied: [ids: string[]]
  clear: []
}>()

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()

const busy = ref(false)
const description = ref('')
const date = ref<number | null>(null)
const categoryId = ref<CategoryId | null>(null)
const isDescriptionOpen = ref(false)
const isDateOpen = ref(false)
const isCategoryOpen = ref(false)

const categoryEligibleCount = computed(() => props.selectedIds.filter((id) => {
  const trn = trnsStore.items?.[id]
  return trn && trn.type !== TrnType.Transfer && trn.categoryId !== 'transfer'
}).length)
const categorySkippedCount = computed(() => props.selectedIds.length - categoryEligibleCount.value)

async function apply(action: HistoryBulkEdit, close: () => void) {
  if (busy.value || !trnsStore.items)
    return

  const result = buildHistoryBulkEdit({
    action,
    ids: props.selectedIds,
    isCategoryTransactible: categoriesStore.isTransactible,
    items: trnsStore.items,
  })

  if (!result.changedIds.length) {
    close()
    return
  }

  busy.value = true
  const saved = await trnsStore.saveTrns(result.values)
  busy.value = false
  if (!saved)
    return

  showSuccessToast('trns.historyTable.bulk.updated', { count: result.changedIds.length })
  emit('applied', result.changedIds)
  close()
}

function selectCategory(id: CategoryId) {
  if (categoriesStore.isTransactible(id) && id !== 'transfer')
    categoryId.value = id
}
</script>

<template>
  <div class="pointer-events-none absolute inset-x-2 bottom-2 z-30 flex justify-center">
    <div class="pointer-events-auto flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-default bg-default/95 p-1.5 shadow-xl backdrop-blur">
      <div class="px-2 text-sm text-highlighted">
        {{ t('trns.historyTable.selected', { count: props.selectedIds.length, total: props.filteredCount }) }}
      </div>

      <BottomSheetOrDropdown
        :isOpen="isDescriptionOpen"
        :title="t('trns.historyTable.bulk.description')"
        isShowCloseBtn
        @closeModal="isDescriptionOpen = false"
        @openModal="isDescriptionOpen = true"
      >
        <template #trigger="{ isActive }">
          <UButton
            :disabled="busy"
            icon="i-lucide-text"
            :label="t('trns.historyTable.bulk.description')"
            :variant="isActive ? 'soft' : 'ghost'"
          />
        </template>
        <template #content="{ close }">
          <div class="grid min-w-80 gap-3 p-3">
            <p class="text-sm text-muted">
              {{ t('trns.historyTable.bulk.willChange', { count: props.selectedIds.length }) }}
            </p>
            <UTextarea
              v-model="description"
              autofocus
              :placeholder="t('trns.historyTable.bulk.descriptionPlaceholder')"
              autoresize
            />
            <div class="grid grid-cols-2 gap-2">
              <UButton
                block
                color="neutral"
                icon="i-lucide-eraser"
                :label="t('trns.historyTable.bulk.clearDescription')"
                variant="soft"
                @click="apply({ type: 'clearDescription' }, close)"
              />
              <UButton
                block
                :disabled="!description.trim()"
                :loading="busy"
                :label="t('base.apply')"
                @click="apply({ type: 'setDescription', value: description }, close)"
              />
            </div>
          </div>
        </template>
      </BottomSheetOrDropdown>

      <BottomSheetOrDropdown
        :isOpen="isDateOpen"
        :title="t('trns.historyTable.bulk.date')"
        isShowCloseBtn
        @closeModal="isDateOpen = false"
        @openModal="isDateOpen = true"
      >
        <template #trigger="{ isActive }">
          <UButton
            :disabled="busy"
            icon="i-lucide-calendar-days"
            :label="t('trns.historyTable.bulk.date')"
            :variant="isActive ? 'soft' : 'ghost'"
          />
        </template>
        <template #content="{ close }">
          <div class="grid min-w-80 gap-3 p-3">
            <p class="text-sm text-muted">
              {{ t('trns.historyTable.bulk.willChange', { count: props.selectedIds.length }) }}
            </p>
            <FormDate v-model="date" :placeholder="t('base.selectDate')" />
            <UButton
              block
              :disabled="date === null"
              :loading="busy"
              :label="t('base.apply')"
              @click="date !== null && apply({ type: 'setDate', value: date }, close)"
            />
          </div>
        </template>
      </BottomSheetOrDropdown>

      <BottomSheetOrDropdown
        :isOpen="isCategoryOpen"
        :title="t('trns.historyTable.bulk.category')"
        isShowCloseBtn
        @closeModal="isCategoryOpen = false"
        @openModal="isCategoryOpen = true"
      >
        <template #trigger="{ isActive }">
          <UButton
            :disabled="busy || categoryEligibleCount === 0"
            icon="i-hugeicons-folder-library"
            :label="t('trns.historyTable.bulk.category')"
            :variant="isActive ? 'soft' : 'ghost'"
          />
        </template>
        <template #custom="{ close, isExpanded }">
          <div class="grid min-w-80 grid-rows-[1fr_auto] overflow-hidden" :class="isExpanded === undefined ? 'h-[65dvh] max-h-160' : 'h-full'">
            <CategoriesSelectorModal
              autofocus
              compactDesktop
              hideCreate
              :selectedIds="categoryId ? [categoryId] : []"
              @selected="selectCategory"
            />
            <div class="grid gap-2 border-t border-default bg-default p-3">
              <p class="text-sm text-muted">
                {{ t('trns.historyTable.bulk.willChange', { count: categoryEligibleCount }) }}
                <span v-if="categorySkippedCount">{{ t('trns.historyTable.bulk.transfersSkipped', { count: categorySkippedCount }) }}</span>
              </p>
              <UButton
                block
                :disabled="!categoryId"
                :loading="busy"
                :label="t('base.apply')"
                @click="categoryId && apply({ type: 'setCategory', value: categoryId }, close)"
              />
            </div>
          </div>
        </template>
      </BottomSheetOrDropdown>

      <UButton
        :aria-label="t('trns.historyTable.clearSelection')"
        color="neutral"
        icon="i-lucide-x"
        variant="ghost"
        @click="emit('clear')"
      />
    </div>
  </div>
</template>
