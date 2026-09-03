<script setup lang="ts">
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

import type { CategoryCountCondition, CategorySelectionCondition, ConditionComparator, EntitySelectionMode, WalletSelectionCondition } from './types'

type EntityCondition = CategoryCountCondition | CategorySelectionCondition | WalletSelectionCondition
type SelectionOption = EntitySelectionMode | 'parentCount' | 'totalCount'

const props = defineProps<{
  modelValue: EntityCondition
}>()
const emit = defineEmits<{
  'update:modelValue': [value: EntityCondition]
}>()

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()
const isOpen = ref(false)
const selectUi = { content: 'z-[80]' }
const entityKey = computed(() => props.modelValue.kind === 'walletSelection' ? 'wallet' : 'category')
const availableIds = computed(() => props.modelValue.kind === 'walletSelection'
  ? Object.keys(walletsStore.itemsComputed).filter(id => !walletsStore.itemsComputed[id]?.isArchived)
  : Object.keys(categoriesStore.items).filter(id => id !== 'transfer' && id !== 'adjustment'))
const options = computed(() => [
  { label: t(`stat.views.conditions.selection.${entityKey.value}.all`), value: 'all' },
  { label: t(`stat.views.conditions.selection.${entityKey.value}.none`), value: 'none' },
  { disabled: availableIds.value.length === 0, label: t(`stat.views.conditions.selection.${entityKey.value}.selected`), value: 'selected' },
  ...(entityKey.value === 'category'
    ? [
        { label: t('stat.views.conditions.fields.parentCategoryCount'), value: 'parentCount' },
        { label: t('stat.views.conditions.fields.allCategoryCount'), value: 'totalCount' },
      ]
    : []),
])
const selectionLabel = computed(() => {
  if (props.modelValue.kind === 'categoryCount')
    return ''
  const names = props.modelValue.ids.map(id => props.modelValue.kind === 'walletSelection'
    ? walletsStore.itemsComputed[id]?.name
    : categoriesStore.items[id]?.name).filter((name): name is string => !!name)
  if (names.length <= 2)
    return names.join(', ')
  return t('stat.views.conditions.selection.multiple', { count: names.length })
})

const selectedOption = computed<SelectionOption>(() => props.modelValue.kind === 'categoryCount'
  ? props.modelValue.scope === 'parent' ? 'parentCount' : 'totalCount'
  : props.modelValue.mode)

function setOption(option: SelectionOption) {
  if (option === 'parentCount' || option === 'totalCount') {
    emit('update:modelValue', {
      comparator: props.modelValue.kind === 'categoryCount' ? props.modelValue.comparator : '>',
      kind: 'categoryCount',
      scope: option === 'parentCount' ? 'parent' : 'all',
      value: props.modelValue.kind === 'categoryCount' ? props.modelValue.value : 0,
    })
    return
  }
  const kind = entityKey.value === 'wallet' ? 'walletSelection' : 'categorySelection'
  const previousIds = props.modelValue.kind === 'categoryCount' ? [] : props.modelValue.ids
  const ids = option === 'selected' ? [previousIds[0] ?? availableIds.value[0]!].filter(Boolean) : []
  emit('update:modelValue', { ids, kind, mode: option })
  if (option === 'selected')
    isOpen.value = true
}

function toggle(id: string) {
  if (props.modelValue.kind === 'categoryCount')
    return
  const selected = props.modelValue.ids.includes(id)
  if (selected && props.modelValue.ids.length === 1)
    return
  const ids = selected ? props.modelValue.ids.filter(item => item !== id) : [...props.modelValue.ids, id]
  emit('update:modelValue', { ...props.modelValue, ids })
}
</script>

<template>
  <USelect
    class="min-w-36 grow"
    :content="{ position: 'item-aligned' }"
    :items="options"
    :modelValue="selectedOption"
    :ui="selectUi"
    :aria-label="t('stat.views.conditions.labels.selectionMode')"
    @update:modelValue="setOption($event as SelectionOption)"
  />

  <template v-if="modelValue.kind === 'categoryCount'">
    <USelect
      class="w-16 shrink-0"
      :content="{ position: 'item-aligned' }"
      :items="['<', '<=', '=', '!=', '>=', '>']"
      :modelValue="modelValue.comparator"
      :ui="selectUi"
      :aria-label="t('stat.views.conditions.labels.comparator')"
      @update:modelValue="$emit('update:modelValue', { ...modelValue, comparator: $event as ConditionComparator })"
    />
    <UInputNumber
      class="w-24 shrink-0"
      :decrement="false"
      :increment="false"
      :min="0"
      :modelValue="modelValue.value"
      :ui="{ base: 'text-center' }"
      @update:modelValue="$emit('update:modelValue', { ...modelValue, value: Number($event) })"
    />
  </template>

  <UPopover
    v-else-if="modelValue.mode === 'selected'"
    v-model:open="isOpen"
    :content="{ align: 'end', side: 'bottom', sideOffset: 6 }"
    :ui="{ content: 'z-[80] h-[min(32rem,var(--reka-popper-available-height))] w-80 max-w-[calc(100vw-1rem)] overflow-hidden p-0' }"
  >
    <UButton
      class="min-w-40 grow justify-between"
      color="neutral"
      trailingIcon="i-lucide-chevron-down"
      variant="outline"
    >
      <span class="truncate">{{ selectionLabel }}</span>
    </UButton>

    <template #content>
      <WalletsSelector
        v-if="modelValue.kind === 'walletSelection'"
        compactDesktop
        hideHeader
        :selectedIds="modelValue.ids"
        @selected="toggle"
      />
      <CategoriesSelectorModal
        v-else
        compactDesktop
        hideCreate
        :selectedIds="modelValue.ids"
        selectableParents
        @selected="toggle"
      />
    </template>
  </UPopover>
</template>
