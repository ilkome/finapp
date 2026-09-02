<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import { debounce } from 'es-toolkit'

import type { StatConfigBlockId } from '~/components/stat/config/schema'
import type { StatConfigPanelId } from '~/components/stat/types'

import { normalizeStatConfigBlockOrder } from '~/components/stat/config/schema'
import { useStatConfigOverlay } from '~/components/stat/config/useStatConfigOverlay'
import { statBaseConfigKey, statCanSplitKey, statConfigKey } from '~/components/stat/injectionKeys'

type ConfigPanelId = Exclude<StatConfigPanelId, 'root'>

const { t } = useI18n()
const { isOpen: isConfigOpen } = useStatConfigOverlay()
const statConfig = inject(statBaseConfigKey)!
provide(statConfigKey, statConfig)
const canSplit = inject(statCanSplitKey, computed(() => false))
const { width } = useWindowSize()
const expandedPanels = ref<ConfigPanelId[]>([])
const [blockSortParent, sortedBlockIds] = useDragAndDrop([] as StatConfigBlockId[], {
  dragHandle: '.sortHandle',
})

const availablePanels = computed<ConfigPanelId[]>(() => {
  return ['statAverage', 'navigation', 'summary', 'wallets', 'chart', 'trns', 'catsRound', 'catsList', 'vertical']
})
const availableSortablePanels = computed<StatConfigBlockId[]>(() =>
  availablePanels.value.filter((panel): panel is StatConfigBlockId => panel !== 'statAverage'),
)

watch(availablePanels, (panels) => {
  expandedPanels.value = expandedPanels.value.filter(panel => panels.includes(panel))
}, { immediate: true })

function isExpanded(panel: ConfigPanelId) {
  return expandedPanels.value.includes(panel)
}

function toggleExpanded(panel: ConfigPanelId) {
  expandedPanels.value = isExpanded(panel)
    ? expandedPanels.value.filter(item => item !== panel)
    : [...expandedPanels.value, panel]
}

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
    class="statConfigPanel grid"
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
      :hasNext="sortedBlockIds.length > 0"
      :isExpanded="isExpanded('statAverage')"
      panel="statAverage"
      @activate="toggleExpanded('statAverage')"
    />

    <div ref="blockSortParent" class="grid">
      <StatConfigBlock
        v-for="(panel, index) in sortedBlockIds"
        :key="panel"
        :hasNext="index < sortedBlockIds.length - 1"
        :isExpanded="isExpanded(panel)"
        :panel
        :showSeparator="(index > 0 || availablePanels.includes('statAverage')) && !isExpanded(index > 0 ? sortedBlockIds[index - 1]! : 'statAverage')"
        sortable
        @activate="toggleExpanded(panel)"
      />
    </div>
  </div>
</template>
