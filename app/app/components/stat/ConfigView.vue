<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { AnimatePresence, Motion } from 'motion-v'

import type { StatConfigPanelId } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'

import { statConfigKey, statConfigPanelKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  isShowWallets?: boolean
  selectedTrnsIds?: TrnId[]
}>()

const activePanel = inject(statConfigPanelKey, ref<StatConfigPanelId>('root'))

const { locale, t } = useI18n()
const statConfig = inject(statConfigKey)!

const isChartShow = computed(() => statConfig.config.value.isChartShow)
const isCatsRoundShow = computed(() => statConfig.config.value.catsRound.isShow)
const isCatsListShow = computed(() => statConfig.config.value.catsList.isShow)

const hasTrnsConfig = computed(() => props.selectedTrnsIds !== undefined)

const availablePanels = computed<StatConfigPanelId[]>(() => {
  const panels: StatConfigPanelId[] = ['root', 'statAverage']
  if (props.isShowWallets)
    panels.push('wallets')
  if (hasTrnsConfig.value)
    panels.push('grouping', 'chart', 'catsRound', 'catsList', 'vertical')
  return panels
})

watch(availablePanels, (panels) => {
  if (!panels.includes(activePanel.value))
    activePanel.value = 'root'
}, { immediate: true })

const panelTitle = computed<string>(() => {
  switch (activePanel.value) {
    case 'wallets':
      return t('stat.config.wallets.title')
    case 'statAverage':
      return t('stat.config.statAverage.title')
    case 'grouping':
      return t('stat.config.grouping.label')
    case 'chart':
      return t('stat.config.chartShow.title')
    case 'catsRound':
      return t('stat.config.categories.rounds.title')
    case 'catsList':
      return t('stat.config.categories.list.title')
    case 'vertical':
      return t('stat.config.categories.vertical.title')
    default:
      return ''
  }
})

const panelDescription = computed<string>(() => {
  switch (activePanel.value) {
    case 'wallets':
      return t('stat.config.wallets.description')
    case 'statAverage':
      return t('stat.config.statAverage.description')
    case 'grouping':
      return t('stat.config.grouping.description')
    case 'catsRound':
      return t('stat.config.categories.rounds.description')
    case 'catsList':
      return t('stat.config.categories.list.description')
    default:
      return ''
  }
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

function toggleSection<K extends 'catsList' | 'catsRound' | 'statAverage' | 'vertical' | 'wallets'>(key: K, current: boolean) {
  statConfig.updateConfig(key, { isShow: !current } as never)
}

function toggleChartShow() {
  statConfig.updateConfig('isChartShow', !isChartShow.value)
}

const panelToggleValue = computed<boolean | undefined>(() => {
  switch (activePanel.value) {
    case 'wallets':
      return statConfig.config.value.wallets.isShow
    case 'statAverage':
      return statConfig.config.value.statAverage.isShow
    case 'chart':
      return isChartShow.value
    case 'catsRound':
      return isCatsRoundShow.value
    case 'catsList':
      return isCatsListShow.value
    case 'vertical':
      return statConfig.config.value.vertical.isShow
    default:
      return undefined
  }
})

function togglePanelSection() {
  switch (activePanel.value) {
    case 'wallets':
      toggleSection('wallets', statConfig.config.value.wallets.isShow)
      break
    case 'statAverage':
      toggleSection('statAverage', statConfig.config.value.statAverage.isShow)
      break
    case 'chart':
      toggleChartShow()
      break
    case 'catsRound':
      toggleSection('catsRound', isCatsRoundShow.value)
      break
    case 'catsList':
      toggleSection('catsList', isCatsListShow.value)
      break
    case 'vertical':
      toggleSection('vertical', statConfig.config.value.vertical.isShow)
      break
  }
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
  [locale, () => props.isShowWallets, () => props.selectedTrnsIds],
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
  isShow?: boolean
  key: string
  panel?: Exclude<StatConfigPanelId, 'root'>
  subtitle?: string
  title: string
  toggle?: () => void
}

const rows = computed<RootRow[]>(() => {
  const list: RootRow[] = []

  if (props.isShowWallets) {
    list.push({
      isShow: statConfig.config.value.wallets.isShow,
      key: 'wallets',
      panel: 'wallets',
      subtitle: t('stat.config.wallets.subtitle', { count: statConfig.config.value.wallets.count }),
      title: t('stat.config.wallets.title'),
      toggle: () => toggleSection('wallets', statConfig.config.value.wallets.isShow),
    })
  }

  list.push({
    isShow: statConfig.config.value.statAverage.isShow,
    key: 'statAverage',
    panel: 'statAverage',
    subtitle: t('stat.config.statAverage.subtitle', { count: statConfig.config.value.statAverage.count }),
    title: t('stat.config.statAverage.title'),
    toggle: () => toggleSection('statAverage', statConfig.config.value.statAverage.isShow),
  })

  if (hasTrnsConfig.value) {
    list.push({
      isShow: isChartShow.value,
      key: 'chart',
      panel: 'chart',
      title: t('stat.config.chartShow.title'),
      toggle: toggleChartShow,
    })
    list.push({
      key: 'grouping',
      panel: 'grouping',
      subtitle: t(`stat.config.grouping.${statConfig.config.value.grouping}`),
      title: t('stat.config.grouping.label'),
    })
    list.push({
      isShow: isCatsRoundShow.value,
      key: 'catsRound',
      panel: 'catsRound',
      title: t('stat.config.categories.rounds.title'),
      toggle: () => toggleSection('catsRound', isCatsRoundShow.value),
    })
    list.push({
      isShow: isCatsListShow.value,
      key: 'catsList',
      panel: 'catsList',
      title: t('stat.config.categories.list.title'),
      toggle: () => toggleSection('catsList', isCatsListShow.value),
    })
    list.push({
      isShow: statConfig.config.value.vertical.isShow,
      key: 'vertical',
      panel: 'vertical',
      title: t('stat.config.categories.vertical.title'),
      toggle: () => toggleSection('vertical', statConfig.config.value.vertical.isShow),
    })
    list.push({
      isShow: statConfig.config.value.trns.isShow,
      key: 'trns',
      title: t('trns.title'),
      toggle: () => statConfig.updateConfig('trns', { isShow: !statConfig.config.value.trns.isShow }),
    })
  }

  return list
})

function onRowActivate(row: RootRow) {
  if (row.panel)
    open(row.panel)
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
              class="bg-elevated/50 mx-2 h-px"
            />
            <StatConfigRow
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
          <StatConfigPanelsStatAverage
            v-else-if="activePanel === 'statAverage'"
          />
          <StatConfigPanelsGrouping
            v-else-if="activePanel === 'grouping'"
          />
          <StatConfigPanelsChart
            v-else-if="activePanel === 'chart'"
          />
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
