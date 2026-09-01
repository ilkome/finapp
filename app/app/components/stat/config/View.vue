<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import { debounce } from 'es-toolkit'

import type { StatConfigBlockId } from '~/components/stat/config/schema'
import type { StatConfigScreen } from '~/components/stat/config/types'
import type { StatConfigPanelId } from '~/components/stat/types'

import { PANELS } from '~/components/stat/config/panels/registry'
import { normalizeStatConfigBlockOrder } from '~/components/stat/config/schema'
import { useStatConfigOverlay } from '~/components/stat/config/useStatConfigOverlay'
import { statBaseConfigKey, statCanSplitKey, statConfigKey, statViewControllerKey } from '~/components/stat/injectionKeys'

type ConfigPanelId = Exclude<StatConfigPanelId, 'root'>

// hasCategoryBreakdown needs an explicit `true` default: an absent Boolean prop would
// otherwise cast to false and hide the category-breakdown controls (grouping / rounds /
// list / vertical) on every page that never opts out. Only leaf categories pass false.
const props = withDefaults(defineProps<{
  hasCategoryBreakdown?: boolean
  hasTrnsConfig?: boolean
  isShowWallets?: boolean
}>(), {
  hasCategoryBreakdown: true,
})

const emit = defineEmits<{
  screenChange: [screen: StatConfigScreen | null]
}>()

const { t } = useI18n()
const { isOpen: isConfigOpen } = useStatConfigOverlay()
const statConfig = inject(statBaseConfigKey)!
provide(statConfigKey, statConfig)
const viewController = inject(statViewControllerKey, null)
const hasActiveView = computed(() => !!viewController?.activeView.value)
const canSplit = inject(statCanSplitKey, computed(() => false))
const { width } = useWindowSize()
const expandedPanels = ref<ConfigPanelId[]>([])
const isSortingBlocks = ref(false)
const isSortingViews = ref(false)
const [blockSortParent, sortedBlockIds] = useDragAndDrop([] as StatConfigBlockId[], {
  dragHandle: '.sortHandle',
})

const showCategoryConfig = computed(() => props.hasTrnsConfig && props.hasCategoryBreakdown)

const availablePanels = computed<ConfigPanelId[]>(() => {
  const panels: ConfigPanelId[] = ['statAverage', 'navigation', 'summary']
  if (props.isShowWallets)
    panels.push('wallets')
  if (props.hasTrnsConfig)
    panels.push('chart', 'trns')
  if (showCategoryConfig.value)
    panels.push('catsRound', 'catsList', 'vertical')
  return panels
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

type RootRow = {
  cycle?: () => void
  icon?: string
  key: string
  panel?: ConfigPanelId
  title: string
}

function panelRow(panel: ConfigPanelId): RootRow {
  const def = PANELS[panel]
  return {
    icon: def.icon,
    key: panel,
    panel,
    title: t(def.titleKey),
  }
}

const sortableRows = computed<RootRow[]>(() => {
  const available = new Set(availableSortablePanels.value)
  return statConfig.config.value.page.blockOrder
    .filter(panel => available.has(panel))
    .map(panelRow)
})
const rows = computed<RootRow[]>(() => [
  ...(availablePanels.value.includes('statAverage') ? [panelRow('statAverage')] : []),
  ...sortableRows.value,
])

function isPreviousExpanded(index: number) {
  const previous = rows.value[index - 1]?.panel
  return !!previous && isExpanded(previous)
}

const pageLayoutItems = computed(() => ['combined', 'split'].map(value => ({
  label: t(`stat.view.pageLayout.${value}.label`),
  value,
})))
const blockSortAreaStyle = computed(() => ({
  maxHeight: width.value < 767 ? 'calc(80dvh - 4rem)' : 'calc(100dvh - 5rem)',
}))

function enterBlockSortMode() {
  expandedPanels.value = []
  const available = new Set(availableSortablePanels.value)
  sortedBlockIds.value = statConfig.config.value.page.blockOrder.filter(panel => available.has(panel))
  isSortingBlocks.value = true
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

function exitBlockSortMode() {
  persistBlockOrder.flush()
  isSortingBlocks.value = false
}

watch(sortedBlockIds, () => {
  if (isSortingBlocks.value)
    persistBlockOrder()
}, { deep: true })

watch(isConfigOpen, (isOpen) => {
  if (!isOpen)
    exitBlockSortMode()
})

watchEffect(() => {
  emit('screenChange', isSortingBlocks.value
    ? { onBack: exitBlockSortMode, title: t('stat.views.sortBlocks') }
    : null)
})

onBeforeUnmount(() => {
  persistBlockOrder.flush()
  emit('screenChange', null)
})

function onViewsSortingVisibility(value: boolean) {
  isSortingViews.value = value
  if (value)
    exitBlockSortMode()
}

function onRowActivate(row: RootRow) {
  if (row.panel)
    toggleExpanded(row.panel)
  else if (row.cycle)
    row.cycle()
}
</script>

<template>
  <div
    class="statConfigPanel grid"
    :class="!isSortingBlocks && width < 767 && 'pb-6'"
  >
    <StatViewsManagement
      :isSortingBlocks
      @sortBlocks="enterBlockSortMode"
      @sortingVisibility="onViewsSortingVisibility"
    />
    <div
      v-show="isSortingBlocks"
      class="flex min-h-0 flex-col px-1"
      :style="blockSortAreaStyle"
    >
      <div
        ref="blockSortParent"
        class="grid min-h-0 content-start gap-1 overflow-y-auto overscroll-contain py-px"
      >
        <UiElement
          v-for="panel in sortedBlockIds"
          :key="panel"
          insideClasses="group relative min-h-[46px] rounded-md bg-elevated/30 pl-4"
        >
          <Icon :name="PANELS[panel].icon" class="shrink-0 text-muted" size="20" />
          <div class="grid grow gap-0.5 overflow-hidden">
            <UiEntityName>
              {{ t(PANELS[panel].titleKey) }}
            </UiEntityName>
          </div>
          <div
            class="sortHandle absolute right-0 flex-center h-full cursor-grab rounded-md px-3 group-hover:bg-accented active:cursor-grabbing"
            :aria-label="t('stat.views.drag')"
          >
            <Icon name="lucide:grip-vertical" size="20" />
          </div>
        </UiElement>
      </div>
    </div>
    <template v-if="!isSortingBlocks && !isSortingViews">
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

      <template
        v-for="(row, i) in rows"
        :key="row.key"
      >
        <div
          v-if="i > 0 && !isPreviousExpanded(i)"
          aria-hidden="true"
          class="mx-2 -my-px h-px bg-elevated/50"
        />
        <div
          class="-mt-px rounded-lg border"
          :class="{
            'mb-3': i < rows.length - 1 && row.panel && isExpanded(row.panel),
            'overflow-hidden border-default': row.panel && isExpanded(row.panel),
            'border-transparent': !row.panel || !isExpanded(row.panel),
          }"
        >
          <StatConfigRow
            :data-stat-config-row="row.key"
            :hasPanel="!!row.panel"
            :icon="row.icon"
            :isExpanded="row.panel ? isExpanded(row.panel) : false"
            :title="row.title"
            @activate="onRowActivate(row)"
          />
          <UCollapsible
            v-if="row.panel"
            :open="isExpanded(row.panel)"
            :ui="{ content: 'overflow-hidden' }"
          >
            <template #content>
              <div
                class="grid gap-3"
                :class="row.panel === 'catsRound' ? 'pr-3 pb-3 pl-2' : 'px-3 pb-4'"
              >
                <div v-if="hasActiveView" class="grid gap-1">
                  <StatConfigBlockRules :panel="row.panel" />
                  <StatConfigSyncPanelButton :panel="row.panel" />
                </div>
                <template v-else>
                  <StatConfigPanelVisibility :panel="row.panel" />
                  <StatConfigPanelContent :panel="row.panel" />
                  <StatConfigSyncPanelButton :panel="row.panel" />
                </template>
              </div>
            </template>
          </UCollapsible>
        </div>
      </template>
    </template>
  </div>
</template>
