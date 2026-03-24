<script setup lang="ts">
import { useStatChart } from '~/components/stat/chart/useStatChart'
import { statConfigKey } from '~/components/stat/injectionKeys'
import { chartViewOptions } from '~/components/stat/useStatConfig'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  isShowWallets?: boolean
}>()

const statConfig = inject(statConfigKey)!
const { t } = useI18n()
const walletsStore = useWalletsStore()
const { chartTypeOptions } = useStatChart()

const isOpen = ref(false)
</script>

<template>
  <BottomSheetOrDropdown
    :title="t('stat.config.menu.label')"
    :isOpen
    isShowCloseBtn
    @openModal="isOpen = true"
    @closeModal="isOpen = false"
  >
    <template #trigger>
      <UTooltip :text="t('stat.config.menu.label')">
        <UiActionButton :ariaLabel="t('stat.config.menu.label')">
          <Icon name="lucide:settings-2" size="20" />
        </UiActionButton>
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

          <StatConfigSwitch
            configKey="isChartShow"
            :title="t('stat.config.chartShow.label')"
          />

          <StatConfigSwitch
            v-if="statConfig.config.value.isChartShow"
            configKey="date"
            field="isShowQuick"
            :title="t('stat.config.date.quick.label')"
          />

          <!-- Chart: showed -->
          <div
            v-if="statConfig.config.value.isChartShow"
            class="grid gap-4"
          >
            <StatConfigSwitch
              configKey="chart"
              field="isShowAverage"
              :title="t('stat.config.chart.average.label')"
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
                  v-for="item in chartTypeOptions"
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

          <StatConfigSwitch
            configKey="wallets"
            field="isShow"
            :title="t('stat.config.wallets.label')"
          />

          <!-- Wallets: form -->
          <div
            v-if="statConfig.config.value.wallets.isShow"
            class="flex gap-4 pt-2"
          >
            <UiNumberStepper
              :modelValue="statConfig.config.value.wallets.count"
              :min="1"
              :max="walletsStore.sortedIds.length"
              @update:modelValue="value => statConfig.updateConfig('wallets', { count: value })"
            />
          </div>
        </div>

        <!-- Statistics -->
        <div
          class="border-item-3 border-b pb-3"
        >
          <UiTitleSection size="sm" class="pb-2">
            {{ t('statistics.title') }}
          </UiTitleSection>

          <StatConfigSwitch
            configKey="statAverage"
            field="isShow"
            :title="t('stat.config.statAverage.count.label')"
          />

          <!-- Average -->
          <div
            v-if="statConfig.config.value.statAverage.isShow"
            class="flex gap-4 pt-2"
          >
            <UiNumberStepper
              :modelValue="statConfig.config.value.statAverage.count"
              :min="1"
              @update:modelValue="value => statConfig.updateConfig('statAverage', { count: value })"
            />
          </div>
        </div>

        <StatCategoriesButtons />

        <slot :close="close" />
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
