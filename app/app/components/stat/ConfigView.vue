<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'
import type { GroupingMode } from '~/components/stat/useStatConfig'
import type { TrnId } from '~/components/trns/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useStatCategories } from '~/components/stat/categories/useStatCategories'
import { useStatChart } from '~/components/stat/chart/useStatChart'
import { statConfigKey } from '~/components/stat/injectionKeys'
import { chartViewOptions, groupingModes, resolveGrouped } from '~/components/stat/useStatConfig'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = withDefaults(defineProps<{
  filteredCategoriesIds?: CategoryId[]
  isShowWallets?: boolean
  preCategoriesIds?: CategoryId[]
  selectedTrnsIds?: TrnId[]
}>(), {
  filteredCategoriesIds: () => [],
})

const { t } = useI18n()
const visibleCategoriesLimit = 12

const { computeCategoriesWithData } = useStatCategories()
const categoriesStore = useCategoriesStore()
const statConfig = inject(statConfigKey)!
const walletsStore = useWalletsStore()
const isExpandedChartCard = useStorage('stat-config-expanded-chart', false)
const isExpandedRoundCard = useStorage('stat-config-expanded-round', false)
const isExpandedListCard = useStorage('stat-config-expanded-list', false)
const isExpandedWalletsCard = useStorage('stat-config-expanded-wallets', false)
const isExpandedStatAverageCard = useStorage('stat-config-expanded-stat-average', false)
const isExpandedGroupingCard = useStorage('stat-config-expanded-grouping', false)

const { chartTypeOptions } = useStatChart()
const isChartShow = computed(() => statConfig.config.value.isChartShow)

const grouping = computed(() => statConfig.config.value.grouping)
const isAutoGrouping = computed(() => grouping.value === 'auto')

const isExpanded = computed(() => statConfig.config.value.catsRound.isExpanded)
const isChartGrouped = computed(() => resolveGrouped(statConfig.config.value.chart.isGrouped, grouping.value))
const isCatsRoundGrouped = computed(() => resolveGrouped(statConfig.config.value.catsRound.isGrouped, grouping.value))
const isShowFavorites = computed(() => statConfig.config.value.catsRound.isShowFavorites)
const isShowRecent = computed(() => statConfig.config.value.catsRound.isShowRecent)

const isCatsRoundShow = computed(() => statConfig.config.value.catsRound.isShow)
const isCatsListShow = computed(() => statConfig.config.value.catsList.isShow)

const mergedPreCategoriesIds = computed(() => {
  const ids: CategoryId[] = []
  const seen = new Set<CategoryId>()

  function addId(id: CategoryId) {
    if (!seen.has(id)) {
      seen.add(id)
      ids.push(id)
    }
  }

  if (props.preCategoriesIds) {
    for (const id of props.preCategoriesIds)
      addId(id)
  }

  if (isShowFavorites.value) {
    for (const id of categoriesStore.favoriteCategoriesIds)
      addId(id)
  }

  if (isShowRecent.value) {
    for (const id of categoriesStore.recentCategoriesIds)
      addId(id)
  }

  for (const id of props.filteredCategoriesIds)
    addId(id)

  return ids
})

const roundCategories = computed(() => computeCategoriesWithData(props.selectedTrnsIds ?? [], isCatsRoundGrouped.value, mergedPreCategoriesIds.value))

function toggleMaster(key: 'catsList' | 'catsRound' | 'trns' | 'vertical', current: boolean) {
  statConfig.updateConfig(key, { isShow: !current } as never)
}

function toggleChartShow() {
  statConfig.updateConfig('isChartShow', !isChartShow.value)
}

function toggleGroupedWithReset(key: 'catsList' | 'catsRound' | 'chart', currentEffective: boolean) {
  if (!isAutoGrouping.value) {
    statConfig.updateConfig('grouping', 'auto')
    return
  }
  statConfig.updateConfig(key, { isGrouped: !currentEffective } as never)
}

function setGrouping(mode: GroupingMode) {
  statConfig.updateConfig('grouping', mode)
}
</script>

<template>
  <div class="grid gap-4">
    <!-- Wallets -->
    <div v-if="props.isShowWallets" class="border-default overflow-hidden rounded-xl border">
      <div class="hover:bg-elevated/50 flex items-stretch" :class="{ 'pb-px': isExpandedWalletsCard }">
        <div
          class="flex grow cursor-pointer rounded-tr-sm rounded-br-sm px-3 py-2"
          @click="isExpandedWalletsCard = !isExpandedWalletsCard"
        >
          <div class="flex items-center gap-1">
            <div class="text-toned text-sm leading-none font-medium tracking-wide">
              {{ t('stat.config.wallets.title') }}
            </div>
            <Icon
              :name="isExpandedWalletsCard ? 'lucide:chevron-down' : 'lucide:chevron-right'"
              size="18"
              class="text-muted mt-px"
            />
          </div>
        </div>
        <div class="mx-1 my-1 h-auto w-px bg-[var(--ui-border)]" />
        <div class="hover:bg-muted/30 flex h-auto shrink-0 cursor-pointer items-center rounded-tl-sm rounded-bl-sm px-3" @click.stop="statConfig.updateConfig('wallets', { isShow: !statConfig.config.value.wallets.isShow })">
          <FormSwitch :value="statConfig.config.value.wallets.isShow" />
        </div>
      </div>
      <div v-if="isExpandedWalletsCard" class="p-2 transition-opacity" :class="{ 'pointer-events-none opacity-50': !statConfig.config.value.wallets.isShow }">
        <UiNumberStepper
          :modelValue="statConfig.config.value.wallets.count"
          :min="1"
          :max="walletsStore.sortedIds.length"
          @update:modelValue="value => statConfig.updateConfig('wallets', { count: value })"
        />
      </div>
    </div>

    <!-- Statistics -->
    <div class="border-default overflow-hidden rounded-xl border">
      <div class="hover:bg-elevated/50 flex items-stretch" :class="{ 'pb-px': isExpandedStatAverageCard }">
        <div
          class="flex grow cursor-pointer rounded-tr-sm rounded-br-sm px-3 py-2"
          @click="isExpandedStatAverageCard = !isExpandedStatAverageCard"
        >
          <div class="flex items-center gap-1">
            <div class="text-toned text-sm leading-none font-medium tracking-wide">
              {{ t('statistics.title') }}
            </div>
            <Icon
              :name="isExpandedStatAverageCard ? 'lucide:chevron-down' : 'lucide:chevron-right'"
              size="18"
              class="text-muted mt-px"
            />
          </div>
        </div>
        <div class="mx-1 my-1 h-auto w-px bg-[var(--ui-border)]" />
        <div class="hover:bg-muted/30 flex h-auto shrink-0 cursor-pointer items-center rounded-tl-sm rounded-bl-sm px-3" @click.stop="statConfig.updateConfig('statAverage', { isShow: !statConfig.config.value.statAverage.isShow })">
          <FormSwitch :value="statConfig.config.value.statAverage.isShow" />
        </div>
      </div>
      <div v-if="isExpandedStatAverageCard" class="p-2 transition-opacity" :class="{ 'pointer-events-none opacity-50': !statConfig.config.value.statAverage.isShow }">
        <UiNumberStepper
          :modelValue="statConfig.config.value.statAverage.count"
          :min="1"
          @update:modelValue="value => statConfig.updateConfig('statAverage', { count: value })"
        />
      </div>
    </div>

    <div
      v-if="props.selectedTrnsIds"
      class="grid gap-2"
    >
      <!-- Global grouping -->
      <div class="border-default overflow-hidden rounded-xl border">
        <div class="hover:bg-elevated/50 flex items-stretch">
          <div
            class="flex grow cursor-pointer rounded-tr-sm rounded-br-sm px-3 py-2"
            @click="isExpandedGroupingCard = !isExpandedGroupingCard"
          >
            <div class="flex items-center gap-1">
              <div class="text-toned text-sm leading-none font-medium tracking-wide">
                {{ t('stat.config.grouping.label') }}
              </div>
              <Icon
                :name="isExpandedGroupingCard ? 'lucide:chevron-down' : 'lucide:chevron-right'"
                size="18"
                class="text-muted mt-px"
              />
            </div>
          </div>
        </div>
        <div v-if="isExpandedGroupingCard" class="p-2 transition-opacity">
          <UiTabsBar>
            <UiTabsItemPill
              v-for="mode in groupingModes"
              :key="mode"
              variant="outline"
              :isActive="grouping === mode"
              class="grow"
              @click="setGrouping(mode)"
            >
              {{ t(`stat.config.grouping.${mode}`) }}
            </UiTabsItemPill>
          </UiTabsBar>
        </div>
      </div>

      <div class="grid gap-3">
        <!-- Chart -->
        <div class="border-default overflow-hidden rounded-xl border">
          <div class="hover:bg-elevated/50 flex items-stretch" :class="{ 'pb-px': isExpandedChartCard }">
            <div
              class="flex grow cursor-pointer rounded-tr-sm rounded-br-sm px-3 py-2"
              @click="isExpandedChartCard = !isExpandedChartCard"
            >
              <div class="flex items-center gap-1">
                <div class="text-toned text-sm leading-none font-medium tracking-wide">
                  {{ t('stat.config.chartShow.title') }}
                </div>
                <Icon
                  :name="isExpandedChartCard ? 'lucide:chevron-down' : 'lucide:chevron-right'"
                  size="18"
                  class="text-muted mt-px"
                />
              </div>
            </div>

            <div class="mx-1 my-1 h-auto w-px bg-[var(--ui-border)]" />
            <div
              class="hover:bg-muted/30 flex h-auto shrink-0 cursor-pointer items-center rounded-tl-sm rounded-bl-sm px-3"
              @click.stop="toggleChartShow"
            >
              <FormSwitch :value="isChartShow" />
            </div>
          </div>

          <div
            v-if="isExpandedChartCard"
            class="p-2 transition-opacity"
            :class="{ 'pointer-events-none opacity-50': !isChartShow }"
          >
            <StatConfigSwitch
              configKey="date"
              field="isShowQuick"
              :title="t('stat.config.date.quick.label')"
            />
            <StatConfigSwitch
              configKey="chart"
              field="isShowAverage"
              :title="t('stat.config.chart.average.label')"
            />
            <UiSwitchItem
              :checkboxValue="statConfig.config.value.chart.mode === 'categories'"
              :title="t('stat.config.chart.byCategories')"
              @click="statConfig.updateConfig('chart', { mode: statConfig.config.value.chart.mode === 'categories' ? 'aggregated' : 'categories' })"
            />
            <UiSwitchItem
              v-if="statConfig.config.value.chart.mode === 'categories'"
              :checkboxValue="isChartGrouped"
              :title="t('stat.config.chart.groupByParent')"
              @click="toggleGroupedWithReset('chart', isChartGrouped)"
            />

            <!-- Chart: view (md+ only) -->
            <div class="grid gap-4 pt-4">
              <div class="hidden gap-2 md:grid">
                <UiTitleSection size="sm" class="px-1">
                  {{ t('stat.config.chartView.label') }}
                </UiTitleSection>
                <UiTabsBar>
                  <UiTabsItemPill
                    v-for="view in chartViewOptions"
                    :key="view"
                    variant="outline"
                    :isActive="statConfig.config.value.chartView === view"
                    class="grow"
                    @click="statConfig.updateConfig('chartView', view)"
                  >
                    {{ t(`stat.config.chartView.${view}`) }}
                  </UiTabsItemPill>
                </UiTabsBar>
              </div>

              <!-- Chart: type -->
              <div class="grid gap-2">
                <UiTitleSection size="sm" class="px-1">
                  {{ t('stat.config.chart.type.label') }}
                </UiTitleSection>
                <UiTabsBar>
                  <UiTabsItemPill
                    v-for="item in chartTypeOptions"
                    :key="item.value"
                    variant="outline"
                    :isActive="statConfig.config.value.chartType === item.value"
                    class="flex grow gap-1"
                    @click="statConfig.updateConfig('chartType', item.value)"
                  >
                    <Icon :name="item.icon" :size="16" />
                    {{ item.label }}
                  </UiTabsItemPill>
                </UiTabsBar>
              </div>
            </div>
          </div>
        </div>

        <!-- Round categories -->
        <div class="border-default overflow-hidden rounded-xl border">
          <div class="hover:bg-elevated/50 flex items-stretch" :class="{ 'pb-px': isExpandedRoundCard }">
            <div
              class="flex grow cursor-pointer rounded-tr-sm rounded-br-sm px-3 py-2"
              @click="isExpandedRoundCard = !isExpandedRoundCard"
            >
              <div class="flex items-center gap-1">
                <div class="text-toned text-sm leading-none font-medium tracking-wide">
                  {{ t('stat.config.categories.rounds.title') }}
                </div>
                <Icon
                  :name="isExpandedRoundCard ? 'lucide:chevron-down' : 'lucide:chevron-right'"
                  size="18"
                  class="text-muted mt-px"
                />
              </div>
            </div>
            <div
              class="mx-1 my-1 h-auto w-px bg-[var(--ui-border)]"
            />
            <div
              class="hover:bg-muted/30 flex shrink-0 cursor-pointer items-center rounded-tl-sm rounded-bl-sm px-3"
              @click.stop="toggleMaster('catsRound', isCatsRoundShow)"
            >
              <FormSwitch :value="isCatsRoundShow" />
            </div>
          </div>

          <div
            v-if="isExpandedRoundCard"
            class="grid gap-0.5 p-2 transition-opacity"
            :class="{ 'pointer-events-none opacity-50': !isCatsRoundShow }"
          >
            <UiSwitchItem
              :checkboxValue="isCatsRoundGrouped"
              :title="t('stat.config.categories.rounds.groupByParent')"
              @click="toggleGroupedWithReset('catsRound', isCatsRoundGrouped)"
            />
            <UiSwitchItem
              :checkboxValue="isShowFavorites"
              :title="t('stat.config.categories.rounds.showFavorites')"
              @click="statConfig.updateConfig('catsRound', { isShowFavorites: !isShowFavorites })"
            />
            <UiSwitchItem
              :checkboxValue="isShowRecent"
              :title="t('stat.config.categories.rounds.showRecent')"
              @click="statConfig.updateConfig('catsRound', { isShowRecent: !isShowRecent })"
            />
            <StatConfigSwitch
              configKey="catsRound"
              field="isIconBg"
              :title="t('stat.catButtons.isRoundIcon')"
            />
            <UiSwitchItem
              v-if="roundCategories.length > visibleCategoriesLimit"
              :checkboxValue="isExpanded"
              :title="t('base.toggleExpand')"
              @click="statConfig.updateConfig('catsRound', { isExpanded: !isExpanded })"
            />
          </div>
        </div>

        <!-- List -->
        <div class="border-default overflow-hidden rounded-xl border">
          <div class="hover:bg-elevated/50 flex items-stretch" :class="{ 'pb-px': isExpandedListCard }">
            <div
              class="flex grow cursor-pointer rounded-tr-sm rounded-br-sm px-3 py-2"
              @click="isExpandedListCard = !isExpandedListCard"
            >
              <div class="flex items-center gap-1">
                <div class="text-toned text-sm leading-none font-medium tracking-wide">
                  {{ t('stat.config.categories.list.title') }}
                </div>
                <Icon
                  :name="isExpandedListCard ? 'lucide:chevron-down' : 'lucide:chevron-right'"
                  size="18"
                  class="text-muted mt-px"
                />
              </div>
            </div>
            <div
              class="mx-1 my-1 h-auto w-px bg-[var(--ui-border)]"
            />
            <div
              class="hover:bg-muted/30 flex shrink-0 cursor-pointer items-center rounded-tl-sm rounded-bl-sm px-3"
              @click.stop="toggleMaster('catsList', isCatsListShow)"
            >
              <FormSwitch :value="isCatsListShow" @click="toggleMaster('catsList', isCatsListShow)" />
            </div>
          </div>

          <div
            v-if="isExpandedListCard"
            class="grid gap-0.5 p-2 transition-opacity"
            :class="{ 'pointer-events-none opacity-50': !isCatsListShow }"
          >
            <StatConfigSwitch configKey="catsList" field="isLines" :title="t('stat.catButtons.isLines')" />
            <StatConfigSwitch configKey="catsList" field="isRoundIcon" :title="t('stat.catButtons.isRoundIcon')" />
          </div>
        </div>
      </div>

      <div class="grid gap-0.5">
        <!-- Vertical -->
        <StatConfigSwitch configKey="vertical" field="isShow" :title="t('stat.config.categories.vertical.title')" />

        <!-- Transactions -->
        <StatConfigSwitch configKey="trns" field="isShow" :title="t('trns.title')" />
      </div>
    </div>
  </div>
</template>
