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
  dragHandle: '.viewSortHandle',
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
      <UiElement
        v-for="viewId in sortedViewIds"
        :key="viewId"
        insideClasses="group min-h-[46px] gap-1 px-1 py-1.5"
      >
        <div
          class="viewSortHandle -my-1.5 -ml-1 flex w-11 shrink-0 cursor-grab items-center justify-center self-stretch rounded-l-md text-muted hover:bg-accented active:cursor-grabbing"
          :aria-label="$t('stat.views.drag')"
        >
          <Icon name="lucide:grip-vertical" size="20" />
        </div>
        <button
          type="button"
          class="flex min-w-0 grow items-center self-stretch rounded-md px-1 text-left"
          :aria-pressed="currentId === viewId"
          @click="selectView(viewId)"
        >
          <span class="grid min-w-0 grow gap-0.5">
            <span class="flex min-w-0 items-center gap-1">
              <UiEntityName>
                {{ viewsById.get(viewId)?.name }}
              </UiEntityName>
              <Icon
                v-if="currentId === viewId"
                name="lucide:check"
                class="size-4 shrink-0 text-primary"
              />
            </span>
            <UiEntityName v-if="ruleDescription(viewId)" variant="secondary">
              {{ ruleDescription(viewId) }}
            </UiEntityName>
          </span>
        </button>
        <UDropdownMenu :items="viewActionItems(viewId)" :content="{ align: 'end' }" :modal="false">
          <StatViewsMoreButton :ariaLabel="$t('base.moreOptions')" />
        </UDropdownMenu>
      </UiElement>
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
