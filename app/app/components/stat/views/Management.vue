<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'

import { useStatConfigOverlay } from '~/components/stat/config/useStatConfigOverlay'
import { statViewControllerKey } from '~/components/stat/injectionKeys'
import { generateViewName } from '~/components/stat/views/generateViewName'

import type { ConditionGroup } from './types'

import { ConditionGroupSchema } from './schema'

const props = defineProps<{
  isSortingBlocks?: boolean
}>()

const emit = defineEmits<{
  sortBlocks: []
  sortingVisibility: [value: boolean]
}>()

function createDefaultAutoRule(): ConditionGroup {
  return { children: [{ comparator: '>', kind: 'categoryCount', scope: 'all', value: 0 }], operator: 'and' }
}

const { t } = useI18n()
const { width } = useWindowSize()
const controller = inject(statViewControllerKey, null)
const { isOpen } = useStatConfigOverlay()
const name = ref('')
const isCustomName = ref(false)
const deleteId = ref<string | null>(null)
const isAutoEnabled = ref(false)
const isAutoExpanded = ref(false)
const isSortMode = ref(false)
const autoRule = ref<ConditionGroup>(createDefaultAutoRule())

function enableAutoForEditing() {
  isAutoEnabled.value = true
}

const [sortParent, sortedViewIds] = useDragAndDrop([] as string[], {
  dragHandle: '.sortHandle',
})
const current = computed(() => controller?.activeView.value ?? null)
const suggestion = computed(() => generateViewName(current.value?.autoRule ?? null, {
  and: t('stat.views.and'),
  andMore: count => t('stat.views.andMore', { count }),
  categoryCount: (scope, comparator, value) => t('stat.views.categoryCount', { comparator, scope: t(`stat.views.scope.${scope}`), value }),
  fallback: t('stat.views.new'),
  period: (value, unit) => t(`stat.views.period.${unit}`, { count: value }),
}, controller?.store.views.map(view => view.name) ?? []))
const viewItems = computed(() => [
  ...(controller?.store.views ?? []).map(view => ({
    label: view.name,
    value: view.id,
  })),
])
const effectiveName = computed(() => name.value.trim() || suggestion.value)
const hasMetadataChanges = computed(() => {
  if (!current.value)
    return false
  const ruleChanged = (isAutoEnabled.value || current.value.isAutoEnabled)
    && JSON.stringify(autoRule.value) !== JSON.stringify(current.value.autoRule ?? createDefaultAutoRule())
  return effectiveName.value !== current.value.name
    || isAutoEnabled.value !== current.value.isAutoEnabled
    || ruleChanged
})
const hasChanges = computed(() => !!current.value && (!!controller?.isDirty.value || hasMetadataChanges.value))
const sortAreaStyle = computed(() => ({
  maxHeight: width.value < 767 ? 'calc(80dvh - 7rem)' : 'calc(100dvh - 7rem)',
}))
const activeActions = computed(() => {
  if (!current.value)
    return []
  return [[
    {
      disabled: (controller?.store.views.length ?? 0) < 2,
      icon: 'i-lucide-arrow-down-up',
      label: t('stat.views.sort'),
      onSelect: enterSortMode,
    },
  ], [
    {
      icon: 'i-lucide-copy',
      label: t('base.duplicate'),
      onSelect: (): void => {
        void controller?.duplicate(current.value!)
      },
    },
  ], [
    {
      color: 'error' as const,
      icon: 'i-lucide-trash-2',
      label: t('base.delete'),
      onSelect: (): void => {
        deleteId.value = current.value!.id
      },
    },
  ]]
})

function syncEditorFromView(view: typeof current.value) {
  name.value = view?.name ?? ''
  isCustomName.value = !!view
  isAutoEnabled.value = view?.isAutoEnabled ?? false
  autoRule.value = view?.autoRule ? ConditionGroupSchema.parse(toRaw(view.autoRule)) : createDefaultAutoRule()
}

watch(current, (view) => {
  syncEditorFromView(view)
}, { immediate: true })
watch(suggestion, (value) => {
  if (!isCustomName.value)
    name.value = value
}, { immediate: true })
watch([isOpen, () => controller?.store.isLoaded, () => controller?.activeView.value], ([open, loaded, active]) => {
  if (open && loaded && !active)
    controller?.selectForCurrentContext()
}, { immediate: true })
watch(isSortMode, value => emit('sortingVisibility', value), { immediate: true })
onBeforeUnmount(() => {
  emit('sortingVisibility', false)
})

let autoSaveQueue = Promise.resolve()

function scheduleAutoSave() {
  autoSaveQueue = autoSaveQueue
    .catch(() => undefined)
    .then(async () => {
      if (!controller?.activeView.value || !hasChanges.value || isSortMode.value || props.isSortingBlocks)
        return
      await controller.updateCurrent({
        autoRule: autoRule.value,
        isAutoEnabled: isAutoEnabled.value,
        name: effectiveName.value,
      })
    })
}

watch([
  hasMetadataChanges,
  isSortMode,
  () => props.isSortingBlocks,
], scheduleAutoSave, { immediate: true })

function selectView(id: string | number) {
  const view = controller?.store.views.find(item => item.id === String(id))
  if (view)
    controller?.apply(view)
}

function onNameInput() {
  isCustomName.value = true
}

function toggleAutoEnabled() {
  isAutoEnabled.value = !isAutoEnabled.value
  if (isAutoEnabled.value)
    isAutoExpanded.value = true
}

function enterSortMode() {
  sortedViewIds.value = controller?.store.views.map(view => view.id) ?? []
  isSortMode.value = true
}

function exitSortMode() {
  isSortMode.value = false
}

async function saveViewOrder() {
  if (!controller)
    return
  await controller.store.reorder(sortedViewIds.value)
  exitSortMode()
}

async function remove(id: string) {
  const wasActive = controller?.activeId.value === id
  const index = controller?.store.views.findIndex(view => view.id === id) ?? -1
  await controller?.store.remove(id)
  if (wasActive && controller) {
    const fallback = controller.store.views[Math.min(index, controller.store.views.length - 1)]
    if (fallback)
      controller.apply(fallback, false)
    else controller.clearActive(false)
  }
}
</script>

<template>
  <section v-if="controller" class="grid">
    <div v-if="!isSortMode && !props.isSortingBlocks" class="grid gap-3 px-1 pb-4">
      <div class="flex min-w-0 items-center gap-1">
        <USelect
          class="min-w-0 flex-1"
          :aria-label="$t('stat.views.current')"
          :content="{ position: 'item-aligned' }"
          :items="viewItems"
          :modelValue="controller.activeId.value ?? ''"
          size="xl"
          :ui="{ content: 'z-60' }"
          @update:modelValue="selectView"
        />
        <UDropdownMenu
          v-if="current"
          :items="activeActions"
          :content="{ align: 'end' }"
        >
          <UiActionButton :ariaLabel="$t('base.moreOptions')">
            <Icon name="lucide:ellipsis-vertical" size="20" />
          </UiActionButton>
        </UDropdownMenu>
      </div>

      <div class="flex min-w-0 items-center px-2">
        <UInput
          v-model="name"
          class="min-w-0 flex-1 border-b border-transparent transition-colors focus-within:border-primary hover:border-default"
          :disabled="!current"
          :placeholder="suggestion"
          size="xl"
          :ui="{ base: 'rounded-none px-0 py-2 text-xl font-semibold' }"
          variant="none"
          @update:modelValue="onNameInput"
        />
        <UTooltip :text="$t('stat.views.sortBlocks')">
          <UiActionButton :ariaLabel="$t('stat.views.sortBlocks')" @click="emit('sortBlocks')">
            <Icon name="lucide:arrow-down-up" size="20" />
          </UiActionButton>
        </UTooltip>
      </div>
    </div>

    <div
      v-show="isSortMode"
      class="flex min-h-0 flex-col px-1 pb-4"
      :style="sortAreaStyle"
    >
      <div
        ref="sortParent"
        class="grid min-h-0 content-start gap-1 overflow-y-auto overscroll-contain py-px"
      >
        <UiElement
          v-for="viewId in sortedViewIds"
          :key="viewId"
          insideClasses="group relative min-h-[46px] rounded-md bg-elevated/30 pl-4"
        >
          <div class="grid grow gap-0.5 overflow-hidden">
            <UiEntityName>
              {{ controller.store.views.find(view => view.id === viewId)?.name }}
            </UiEntityName>
          </div>
          <div
            class="sortHandle absolute right-0 flex-center h-full cursor-grab rounded-md px-3 group-hover:bg-accented active:cursor-grabbing"
            :aria-label="$t('stat.views.drag')"
          >
            <Icon name="lucide:grip-vertical" size="20" />
          </div>
        </UiElement>
      </div>
      <div class="relative mt-3 shrink-0 overflow-hidden pt-2">
        <div
          aria-hidden="true"
          class="pointer-events-none absolute inset-0"
          style="background: linear-gradient(to bottom, transparent, var(--ui-bg) 50%)"
        />
        <div class="relative z-10 grid grid-cols-2 gap-2">
          <UiButtonAccent color="neutral" size="xl" variant="soft" @click="exitSortMode">
            {{ $t('base.cancel') }}
          </UiButtonAccent>
          <UiButtonAccent size="xl" @click="saveViewOrder">
            {{ $t('base.save') }}
          </UiButtonAccent>
        </div>
      </div>
    </div>

    <div
      v-if="!isSortMode && !props.isSortingBlocks"
      class="rounded-lg border"
      :class="isAutoExpanded
        ? 'mb-3 overflow-hidden border-default'
        : 'border-transparent'"
    >
      <StatConfigRow
        data-stat-config-row="auto"
        hasPanel
        hasToggle
        icon="lucide:wand-sparkles"
        :isExpanded="isAutoExpanded"
        :isShow="isAutoEnabled"
        :title="$t('stat.views.auto')"
        @activate="isAutoExpanded = !isAutoExpanded"
        @toggle="toggleAutoEnabled"
      />
      <UCollapsible :open="isAutoExpanded" :ui="{ content: 'overflow-hidden' }">
        <template #content>
          <div
            class="px-3 pb-4"
            @focusin.capture="enableAutoForEditing"
            @pointerdown.capture="enableAutoForEditing"
          >
            <StatViewsConditionEditor v-model="autoRule" />
          </div>
        </template>
      </UCollapsible>
    </div>
    <div v-if="!isSortMode && !props.isSortingBlocks && !isAutoExpanded" aria-hidden="true" class="mx-2 -my-px h-px bg-elevated/50" />

    <LayoutConfirmModal
      v-if="deleteId"
      :description="$t('stat.views.deleteConfirm')"
      title=""
      @closed="deleteId = null"
      @confirm="remove(deleteId!)"
    />
  </section>
</template>
