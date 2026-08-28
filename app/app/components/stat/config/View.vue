<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { AnimatePresence, Motion } from 'motion-v'

import type { StatConfigPanelId } from '~/components/stat/types'

import { PANELS } from '~/components/stat/config/panels/registry'
import { statCanSplitKey, statConfigKey, statConfigPanelKey } from '~/components/stat/injectionKeys'

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

const activePanel = inject(statConfigPanelKey, ref<StatConfigPanelId>('root'))

const { locale, t } = useI18n()
const statConfig = inject(statConfigKey)!
const canSplit = inject(statCanSplitKey, computed(() => false))

const showCategoryConfig = computed(() => props.hasTrnsConfig && props.hasCategoryBreakdown)

const availablePanels = computed<StatConfigPanelId[]>(() => {
  const panels: StatConfigPanelId[] = ['root', 'statAverage']
  if (props.isShowWallets)
    panels.push('wallets')
  if (props.hasTrnsConfig)
    panels.push('chart', 'trns')
  if (showCategoryConfig.value)
    panels.push('catsRound', 'catsList', 'vertical')
  return panels
})

watch(availablePanels, (panels) => {
  if (!panels.includes(activePanel.value))
    activePanel.value = 'root'
}, { immediate: true })

function panelIsShow(panel: ConfigPanelId): boolean {
  return PANELS[panel].getIsShow(statConfig.config.value)
}

function togglePanel(panel: ConfigPanelId) {
  PANELS[panel].setIsShow(statConfig, !panelIsShow(panel))
}

const panelTitle = computed<string>(() => activePanel.value === 'root' ? '' : t(PANELS[activePanel.value].titleKey))

const panelDescription = computed<string>(() => {
  if (activePanel.value === 'root')
    return ''
  const { descKey } = PANELS[activePanel.value]
  return descKey ? t(descKey) : ''
})

const direction = ref<1 | -1>(1)

function open(panel: StatConfigPanelId) {
  if (panel === activePanel.value)
    return
  direction.value = 1
  activePanel.value = panel
}

function back() {
  if (activePanel.value === 'root')
    return
  direction.value = -1
  activePanel.value = 'root'
}

const panelToggleValue = computed<boolean | undefined>(() =>
  activePanel.value === 'root' ? undefined : panelIsShow(activePanel.value),
)

function togglePanelSection() {
  if (activePanel.value !== 'root')
    togglePanel(activePanel.value)
}

const rootRef = ref<HTMLElement>()
const { height: rootHeight } = useElementSize(rootRef)

const FALLBACK_MIN_HEIGHT = 360
const lastRootHeight = ref(FALLBACK_MIN_HEIGHT)

watchEffect(() => {
  if (rootHeight.value > 0)
    lastRootHeight.value = rootHeight.value
})

watch(
  [locale, () => props.isShowWallets, () => props.hasTrnsConfig],
  () => {
    lastRootHeight.value = FALLBACK_MIN_HEIGHT
  },
)

const stableMinHeight = computed(() => Math.max(lastRootHeight.value, FALLBACK_MIN_HEIGHT))

const SLIDE_DISTANCE = 8
const SLIDE_DURATION = 0.12
const SLIDE_EASING = [0.4, 0, 0.2, 1] as const

const panelVariants = {
  center: { opacity: 1, x: 0 },
  enter: (dir: 1 | -1) => ({ opacity: 0, x: dir * SLIDE_DISTANCE }),
  exit: (dir: 1 | -1) => ({ opacity: 0, x: dir * -SLIDE_DISTANCE }),
}

const panelTransition = {
  duration: SLIDE_DURATION,
  ease: SLIDE_EASING,
}

type RootRow = {
  cycle?: () => void
  isShow?: boolean
  key: string
  panel?: ConfigPanelId
  subtitle?: string
  title: string
  toggle?: () => void
}

function panelRow(panel: ConfigPanelId): RootRow {
  const def = PANELS[panel]
  const count = def.getCount?.(statConfig.config.value)
  return {
    isShow: panelIsShow(panel),
    key: panel,
    panel,
    subtitle: def.subtitleKey ? t(def.subtitleKey, { count }) : undefined,
    title: t(def.titleKey),
    toggle: () => togglePanel(panel),
  }
}

const rows = computed<RootRow[]>(() => {
  const list: RootRow[] = []

  if (props.isShowWallets)
    list.push(panelRow('wallets'))

  list.push(panelRow('statAverage'))

  if (props.hasTrnsConfig)
    list.push(panelRow('chart'))

  if (showCategoryConfig.value) {
    list.push(panelRow('catsRound'))
    list.push(panelRow('catsList'))
    list.push(panelRow('vertical'))
  }

  if (props.hasTrnsConfig) {
    list.push(panelRow('trns'))
  }

  return list
})

const pageLayoutItems = computed(() => ['combined', 'split'].map(value => ({
  label: t(`stat.view.pageLayout.${value}.label`),
  value,
})))

function onRowActivate(row: RootRow) {
  if (row.panel)
    open(row.panel)
  else if (row.cycle)
    row.cycle()
  else if (row.toggle)
    row.toggle()
}
</script>

<template>
  <div
    class="statConfigPanel"
    :style="{ minHeight: `${stableMinHeight}px` }"
  >
    <AnimatePresence
      :custom="direction"
      mode="wait"
      :initial="false"
    >
      <Motion
        :key="activePanel"
        :custom="direction"
        :variants="panelVariants"
        initial="enter"
        animate="center"
        exit="exit"
        :transition="panelTransition"
      >
        <div
          v-if="activePanel === 'root'"
          ref="rootRef"
          class="grid"
        >
          <template
            v-for="(row, i) in rows"
            :key="row.key"
          >
            <div
              v-if="i > 0"
              aria-hidden="true"
              class="mx-2 h-px bg-elevated/50"
            />
            <StatConfigRow
              :data-stat-config-row="row.key"
              :hasPanel="!!row.panel"
              :hasToggle="!!row.toggle"
              :isShow="row.isShow"
              :subtitle="row.subtitle"
              :title="row.title"
              @activate="onRowActivate(row)"
              @toggle="row.toggle?.()"
            />
          </template>
        </div>

        <div v-else>
          <StatConfigPanelHeader
            :title="panelTitle"
            @back="back"
          />
          <StatConfigPanelToggle
            :description="panelDescription"
            :value="panelToggleValue"
            @toggle="togglePanelSection"
          />
          <StatConfigPanelsWallets
            v-if="activePanel === 'wallets'"
          />
          <StatConfigPanelsAverage
            v-else-if="activePanel === 'statAverage'"
          />
          <StatConfigPanelsChart
            v-else-if="activePanel === 'chart'"
          />
          <div v-else-if="activePanel === 'trns' && canSplit" class="grid gap-2 pt-4">
            <UiTitleSection size="sm" class="px-1">
              {{ t('stat.view.pageLayout.title') }}
            </UiTitleSection>
            <UiTabs
              :items="pageLayoutItems"
              :modelValue="statConfig.config.value.page.layout"
              @update:modelValue="(v) => statConfig.updateConfig('page', { layout: v as 'combined' | 'split' })"
            />
          </div>
          <StatConfigPanelsCatsRound
            v-else-if="activePanel === 'catsRound'"
          />
          <StatConfigPanelsCatsList
            v-else-if="activePanel === 'catsList'"
          />
          <StatConfigPanelsVertical
            v-else-if="activePanel === 'vertical'"
          />
        </div>
      </Motion>
    </AnimatePresence>
  </div>
</template>
