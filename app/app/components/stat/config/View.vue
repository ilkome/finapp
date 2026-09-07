<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import { debounce } from 'es-toolkit'

import type { StatConfigBlockId } from '~/components/stat/config/schema'
import type { StatConfigPanelId } from '~/components/stat/types'

import { normalizeStatConfigBlockOrder, statConfigBlockOrder, statContextBlockIds } from '~/components/stat/config/schema'
import { useStatConfigNav } from '~/components/stat/config/useStatConfigNav'
import { useStatConfigOverlay } from '~/components/stat/config/useStatConfigOverlay'
import { statBaseConfigKey, statCanSplitKey, statConfigKey, statContextBlockIdsKey } from '~/components/stat/injectionKeys'

type ConfigPanelId = Exclude<StatConfigPanelId, 'root'>

const { t } = useI18n()
const { isOpen: isConfigOpen } = useStatConfigOverlay()
const statConfig = inject(statBaseConfigKey)!
provide(statConfigKey, statConfig)
const canSplit = inject(statCanSplitKey, computed(() => false))
const contextBlockIds = inject(statContextBlockIdsKey, computed(() => []))
const { width } = useWindowSize()
const { activePanel, back, open: openPanel } = useStatConfigNav()
const [blockSortParent, sortedBlockIds] = useDragAndDrop([] as StatConfigBlockId[], {
  dragHandle: '.sortHandle',
})

const availablePanels = computed<ConfigPanelId[]>(() => {
  const contextual = new Set(contextBlockIds.value)
  return [
    'statAverage',
    ...statConfigBlockOrder.filter(panel => !statContextBlockIds.includes(panel as typeof statContextBlockIds[number]) || contextual.has(panel as typeof statContextBlockIds[number])),
  ]
})
const availableSortablePanels = computed<StatConfigBlockId[]>(() =>
  availablePanels.value.filter((panel): panel is StatConfigBlockId => panel !== 'statAverage'),
)

// A section can disappear when the report context changes (contextual blocks), so leave it.
watch(availablePanels, (panels) => {
  const panel = activePanel.value
  if (panel && panel !== 'auto' && !panels.includes(panel))
    back()
}, { immediate: true })

const pageLayoutItems = computed(() => ['combined', 'split'].map(value => ({
  label: t(`stat.view.pageLayout.${value}.label`),
  value,
})))
function syncSortedBlockIds() {
  const available = new Set(availableSortablePanels.value)
  sortedBlockIds.value = statConfig.config.value.page.blockOrder.filter(panel => available.has(panel))
}

const persistBlockOrder = debounce(() => {
  const available = new Set(availableSortablePanels.value)
  let sortedIndex = 0
  const blockOrder = statConfig.config.value.page.blockOrder.map((panel) => {
    if (!available.has(panel))
      return panel
    return sortedBlockIds.value[sortedIndex++] ?? panel
  })
  const normalizedBlockOrder = normalizeStatConfigBlockOrder(blockOrder)
  const normalizedSortedIds = normalizedBlockOrder.filter(panel => available.has(panel))
  if (normalizedSortedIds.some((panel, index) => panel !== sortedBlockIds.value[index]))
    sortedBlockIds.value = normalizedSortedIds
  if (normalizedBlockOrder.every((panel, index) => panel === statConfig.config.value.page.blockOrder[index]))
    return
  statConfig.updateConfig('page', { blockOrder: normalizedBlockOrder })
}, 300)

watch(sortedBlockIds, () => {
  persistBlockOrder()
}, { deep: true })

watch([availableSortablePanels, () => statConfig.config.value.page.blockOrder], syncSortedBlockIds, { immediate: true })

watch(isConfigOpen, (isOpen) => {
  if (!isOpen)
    persistBlockOrder.flush()
})

onBeforeUnmount(() => {
  persistBlockOrder.flush()
})
</script>

<template>
  <div
    class="statConfigPanel grid min-w-0"
    :class="width < 767 && 'pb-6'"
  >
    <StatViewsManagement />
    <template v-if="canSplit">
      <div class="-mt-px rounded-lg border border-transparent">
        <StatConfigFieldRow :title="t('stat.view.pageLayout.title')">
          <USelect
            class="w-40 shrink-0"
            :aria-label="t('stat.view.pageLayout.title')"
            :content="{ position: 'item-aligned' }"
            :items="pageLayoutItems"
            :modelValue="statConfig.config.value.page.layout"
            :ui="{ content: 'z-[60]' }"
            @update:modelValue="(v) => statConfig.updateConfig('page', { layout: v as 'combined' | 'split' })"
          />
        </StatConfigFieldRow>
      </div>
      <div aria-hidden="true" class="mx-2 -my-px h-px bg-elevated/50" />
    </template>

    <StatConfigBlock
      v-if="availablePanels.includes('statAverage')"
      panel="statAverage"
      @activate="openPanel('statAverage')"
    />

    <div ref="blockSortParent" class="grid min-w-0">
      <StatConfigBlock
        v-for="(panel, index) in sortedBlockIds"
        :key="panel"
        :panel
        :showSeparator="index > 0 || availablePanels.includes('statAverage')"
        sortable
        @activate="openPanel(panel)"
      />
    </div>
  </div>
</template>
