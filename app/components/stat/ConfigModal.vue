<script setup lang="ts">
import type { StatConfigModal } from '~/components/stat/types'

import { useStatChart } from '~/components/stat/chart/useStatChart'
import { statConfigKey } from '~/components/stat/injectionKeys'
import { chartViewOptions } from '~/components/stat/useStatConfig'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  isShowWallets?: boolean
  statConfigModal: StatConfigModal
}>()

const statConfig = inject(statConfigKey)!
const { t } = useI18n()
const walletsStore = useWalletsStore()
const { chartTypes } = useStatChart()

function updateWalletsLimit(value: number) {
  if (value <= walletsStore.sortedIds.length && value > 0)
    statConfig.updateConfig('wallets', { count: value })
}

function updateStatAverage(value: number) {
  if (value <= 0)
    return

  statConfig.updateConfig('statAverage', { count: value })
}
</script>

<template>
  <BottomSheetOrDropdown
    :title="t('stat.config.menu.label')"
    :isOpen="props.statConfigModal.isShow"
    isShowCloseBtn
    @openModal="props.statConfigModal.show"
    @closeModal="props.statConfigModal.close"
  >
    <template #trigger>
      <UTooltip :text="t('stat.config.menu.label')">
        <UButton
          :aria-label="t('stat.config.menu.label')"
          class="text-muted"
          color="neutral"
          icon="lucide:settings-2"
          size="lg"
          square
          variant="ghost"
        />
      </UTooltip>
    </template>

    <template #content="{ close }">
      <div class="grid gap-4 px-1 py-3 md:px-3 md:!pb-2">
        <BottomSheetClose @click="close" />

        <!-- Chart -->
        <div class="border-item-3 border-b pb-3">
          <UiTitleSection size="sm" class="pb-2">
            {{ t('stat.config.chartShow.title') }}
          </UiTitleSection>

          <UiSwitchItem
            :checkboxValue="statConfig.config.value.isChartShow"
            :title="t('stat.config.chartShow.label')"
            @click="statConfig.updateConfig('isChartShow', !statConfig.config.value.isChartShow)"
          />

          <UiSwitchItem
            v-if="statConfig.config.value.isChartShow"
            :checkboxValue="statConfig.config.value.date.isShowQuick"
            :title="t('stat.config.date.quick.label')"
            @click="statConfig.updateConfig('date', { isShowQuick: !statConfig.config.value.date.isShowQuick })"
          />

          <!-- Chart: showed -->
          <div
            v-if="statConfig.config.value.isChartShow"
            class="grid gap-4"
          >
            <UiSwitchItem
              :checkboxValue="statConfig.config.value.chart.isShowAverage ?? false"
              :title="t('stat.config.chart.average.label')"
              @click="statConfig.updateConfig('chart', { isShowAverage: !statConfig.config.value.chart.isShowAverage })"
            />

            <!-- Chart: view -->
            <div class="hidden gap-3 md:grid">
              <UiTitleSection size="sm">
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
            <div class="grid gap-3">
              <UiTitleSection size="sm">
                {{ t('stat.config.chart.type.label') }}
              </UiTitleSection>

              <UiTabsBar>
                <UiTabsItemPill
                  v-for="item in chartTypes"
                  :key="item.value"
                  variant="outline"
                  :isActive="statConfig.config.value.chartType === item.value"
                  class="flex grow gap-1"
                  @click="statConfig.updateConfig('chartType', item.value)"
                >
                  <Icon
                    :name="item.icon"
                    :size="16"
                  />
                  {{ item.label }}
                </UiTabsItemPill>
              </UiTabsBar>
            </div>
          </div>
        </div>

        <!-- Wallets -->
        <div
          v-if="props.isShowWallets"
          class="border-item-3 border-b pb-3"
        >
          <UiTitleSection size="sm" class="pb-2">
            {{ t('stat.config.wallets.title') }}
          </UiTitleSection>

          <UiSwitchItem
            :checkboxValue="statConfig.config.value.wallets.isShow"
            :title="t('stat.config.wallets.label')"
            @click="statConfig.updateConfig('wallets', { isShow: !statConfig.config.value.wallets.isShow })"
          />

          <!-- Wallets: form -->
          <div
            v-if="statConfig.config.value.wallets.isShow"
            class="flex gap-4 pt-2"
          >
            <div class="flex gap-1">
              <UiChipButton
                :class="[{
                  '!hover:transparent opacity-30': statConfig.config.value.wallets.count === 1,
                }]"
                @click="updateWalletsLimit(statConfig.config.value.wallets.count - 1)"
              >
                <Icon name="lucide:minus" />
              </UiChipButton>
              <FormInput
                :placeholder="t('stat.config.showedWallets.placeholder')"
                :modelValue="statConfig.config.value.wallets.count"
                min="1"
                class="!w-16 max-w-24 !px-2 text-center"
                type="number"
                @update:modelValue="value => statConfig.updateConfig('wallets', { count: +value })"
              />

              <UiChipButton
                :class="{ '!hover:transparent opacity-30': statConfig.config.value.wallets.count >= walletsStore.sortedIds.length }"
                @click="updateWalletsLimit(statConfig.config.value.wallets.count + 1)"
              >
                <Icon name="lucide:plus" />
              </UiChipButton>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div
          class="border-item-3 border-b pb-3"
        >
          <UiTitleSection size="sm" class="pb-2">
            {{ t('statistics.title') }}
          </UiTitleSection>

          <UiSwitchItem
            :checkboxValue="statConfig.config.value.statAverage.isShow"
            :title="t('stat.config.statAverage.count.label')"
            @click="statConfig.updateConfig('statAverage', { isShow: !statConfig.config.value.statAverage.isShow })"
          />

          <!-- Average -->
          <div
            v-if="statConfig.config.value.statAverage.isShow"
            class="flex gap-4 pt-2"
          >
            <div class="flex gap-1">
              <UiChipButton
                :class="[{
                  '!hover:transparent opacity-30': statConfig.config.value.statAverage.count === 1,
                }]"
                @click="updateStatAverage(statConfig.config.value.statAverage.count - 1)"
              >
                <Icon name="lucide:minus" />
              </UiChipButton>
              <FormInput
                :placeholder="t('stat.config.showedWallets.placeholder')"
                :modelValue="statConfig.config.value.statAverage.count"
                min="1"
                class="!w-16 max-w-24 !px-2 text-center"
                type="number"
                @update:modelValue="value => statConfig.updateConfig('statAverage', { count: +value })"
              />

              <UiChipButton
                @click="updateStatAverage(statConfig.config.value.statAverage.count + 1)"
              >
                <Icon name="lucide:plus" />
              </UiChipButton>
            </div>
          </div>
        </div>

        <StatCategoriesButtons />

        <slot :close="close" />
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
