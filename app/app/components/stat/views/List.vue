<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'

import { statViewControllerKey } from '~/components/stat/injectionKeys'
import { isAdaptiveViewId } from '~/components/stat/views/adaptiveView'
import { useStatConditionTitles } from '~/components/stat/views/useConditionTitles'

const { t } = useI18n()
const { conditionGroupTitle } = useStatConditionTitles()
const controller = inject(statViewControllerKey, null)
const deleteId = ref<string | null>(null)
const [viewsParent, sortedViewIds] = useDragAndDrop([] as string[], {
  dragHandle: '.sortableSelectionHandle',
})

const views = computed(() => controller?.store.views ?? [])
const adaptive = computed(() => views.value.find(view => isAdaptiveViewId(view.id)))
const savedViews = computed(() => views.value.filter(view => !isAdaptiveViewId(view.id)))
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

useAutosave(sortedViewIds, () => {
  if (!controller)
    return
  const currentIds = controller.store.savedViews.map(view => view.id)
  if (sortedViewIds.value.every((id, index) => id === currentIds[index]))
    return
  void controller.store.reorder(sortedViewIds.value)
})

watch(() => savedViews.value.map(view => view.id), (ids) => {
  sortedViewIds.value = [...ids]
}, { immediate: true })
</script>

<template>
  <div v-if="controller" class="grid gap-1">
    <UiSortableSelectionItem
      v-if="adaptive"
      :ariaLabel="$t('stat.views.drag')"
      :isSelected="currentId === adaptive.id"
      isFixed
      @select="selectView(adaptive.id)"
    >
      {{ adaptive.name }}
      <template #actions>
        <UDropdownMenu :items="[[{ icon: 'i-lucide-copy', label: t('base.duplicate'), onSelect: () => duplicate(adaptive!.id) }]]" :content="{ align: 'end' }" :modal="false">
          <StatViewsMoreButton :ariaLabel="$t('base.moreOptions')" />
        </UDropdownMenu>
      </template>
    </UiSortableSelectionItem>

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
      @confirm="controller.remove(deleteId!)"
    />
  </div>
</template>
