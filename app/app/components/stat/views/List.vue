<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import { debounce } from 'es-toolkit'

import { statViewControllerKey } from '~/components/stat/injectionKeys'
import { useStatConditionTitles } from '~/components/stat/views/useConditionTitles'

const { t } = useI18n()
const { conditionGroupTitle } = useStatConditionTitles()
const controller = inject(statViewControllerKey, null)
const deleteId = ref<string | null>(null)
const [viewsParent, sortedViewIds] = useDragAndDrop([] as string[], {
  dragHandle: '.sortableSelectionHandle',
})

const views = computed(() => controller?.store.views ?? [])
const viewsById = computed(() => new Map(views.value.map(view => [view.id, view])))
const currentId = computed(() => controller?.activeId.value ?? '')
function ruleDescription(id: string) {
  const view = viewsById.value.get(id)
  if (!view?.isAutoEnabled || !view.autoRule)
    return ''
  return conditionGroupTitle(view.autoRule)
}

function selectView(id: string) {
  const view = viewsById.value.get(id)
  if (view)
    controller?.apply(view)
}

function moveView(id: string, direction: -1 | 1) {
  const index = sortedViewIds.value.indexOf(id)
  const target = index + direction
  if (index < 0 || target < 0 || target >= sortedViewIds.value.length)
    return
  const next = [...sortedViewIds.value]
  const current = next[index]!
  next[index] = next[target]!
  next[target] = current
  sortedViewIds.value = next
}

function duplicate(id: string) {
  const view = viewsById.value.get(id)
  if (view)
    void controller?.duplicate(view)
}

function viewActionItems(id: string) {
  return [[
    { icon: 'i-lucide-copy', label: t('base.duplicate'), onSelect: () => duplicate(id) },
  ], [
    { color: 'error' as const, icon: 'i-lucide-trash-2', label: t('base.delete'), onSelect: () => { deleteId.value = id } },
  ]]
}

const persistViewOrder = debounce(async () => {
  if (!controller)
    return
  const currentIds = controller.store.views.map(view => view.id)
  if (sortedViewIds.value.every((id, index) => id === currentIds[index]))
    return
  await controller.store.reorder(sortedViewIds.value)
}, 300)

watch(() => views.value.map(view => view.id), (ids) => {
  sortedViewIds.value = [...ids]
}, { immediate: true })

watch(sortedViewIds, () => {
  void persistViewOrder()
}, { deep: true })

onBeforeUnmount(() => {
  persistViewOrder.flush()
})

async function remove(id: string) {
  if (!controller)
    return
  if (views.value.length === 1) {
    const fallback = await controller.store.update(id, {
      isActive: true,
      name: t('stat.views.defaultName'),
    })
    if (fallback)
      controller.apply(fallback, false)
    return
  }
  await controller?.store.remove(id)
}
</script>

<template>
  <div v-if="controller" class="grid gap-1">
    <div ref="viewsParent" class="grid gap-1">
      <UiSortableSelectionItem
        v-for="viewId in sortedViewIds"
        :key="viewId"
        :ariaLabel="$t('stat.views.drag')"
        :isSelected="currentId === viewId"
        @move="direction => moveView(viewId, direction)"
        @select="selectView(viewId)"
      >
        {{ viewsById.get(viewId)?.name }}

        <template v-if="ruleDescription(viewId)" #description>
          {{ ruleDescription(viewId) }}
        </template>

        <template #actions>
          <UDropdownMenu :items="viewActionItems(viewId)" :content="{ align: 'end' }" :modal="false">
            <StatViewsMoreButton :ariaLabel="$t('base.moreOptions')" />
          </UDropdownMenu>
        </template>
      </UiSortableSelectionItem>
    </div>

    <LayoutConfirmModal
      v-if="deleteId"
      :description="$t('stat.views.deleteConfirm')"
      title=""
      @closed="deleteId = null"
      @confirm="remove(deleteId!)"
    />
  </div>
</template>
