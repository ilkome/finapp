<script setup lang="ts">
import type { StatConfigModal } from '~/components/stat/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'

import { useStatChart } from '~/components/stat/chart/useStatChart'
import { chartViewOptions } from '~/components/stat/useStatConfig'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  isShowWallets?: boolean
  statConfigModal: StatConfigModal
}>()

const statConfig = inject('statConfig') as StatConfigProvider
const { t } = useI18n()
const walletsStore = useWalletsStore()
const { chartTypes } = useStatChart()

function updateWalletsLimit(value: number) {
  if (value <= walletsStore.sortedIds.length && value > 0)
    statConfig.updateConfig('wallets', { count: value })
}
</script>

<template>
  <BottomSheetOrDropdown
    :title="t('stat.config.menu.label')"
    :isOpen="props.statConfigModal.isShow"
    @onOpenModal="props.statConfigModal.show"
    @onCloseModal="props.statConfigModal.close"
  >
    <template #trigger>
      <UiItem1>
        <Icon name="lucide:settings-2" size="20" />
      </UiItem1>
    </template>

    <template #content="{ close }">
      <div class="grid gap-4 px-1 py-3 md:px-3 md:!pb-0">
        <BottomSheetClose @click="close" />

        <!-- Chart -->
        <div class="border-b border-item-3 pb-3">
          <UiTitleOption class="pb-2">
            {{ t('stat.config.chartShow.title') }}
          </UiTitleOption>

          <UiCheckbox
            :checkboxValue="statConfig.config.value.chartShow"
            :title="t('stat.config.chartShow.label')"
            @click="statConfig.updateConfig('chartShow', !statConfig.config.value.chartShow)"
          />

          <!-- Chart: showed -->
          <div
            v-if="statConfig.config.value.chartShow"
            class="grid gap-4"
          >
            <UiCheckbox
              :checkboxValue="statConfig.config.value.chart.isShowAverage ?? false"
              :title="t('stat.config.chart.average.label')"
              @click="statConfig.updateConfig('chart', { isShowAverage: !statConfig.config.value.chart.isShowAverage })"
            />

            <!-- Chart: view -->
            <div class="hidden gap-3 md:grid">
              <UiTitleOption>
                {{ t('stat.config.chartView.label') }}
              </UiTitleOption>

              <UiTabs1>
                <UiTabsItem1
                  v-for="view in chartViewOptions"
                  :key="view"
                  :isActive="statConfig.config.value.chartView === view"
                  @click="statConfig.updateConfig('chartView', view)"
                >
                  {{ t(`stat.config.chartView.${view}`) }}
                </UiTabsItem1>
              </UiTabs1>
            </div>

            <!-- Chart: type -->
            <div class="grid gap-3">
              <UiTitleOption>
                {{ t('stat.config.chart.type.label') }}
              </UiTitleOption>

              <UiTabs1>
                <UiTabsItem1
                  v-for="item in chartTypes"
                  :key="item.value"
                  :isActive="statConfig.config.value.chartType === item.value"
                  class="flex gap-1"
                  @click="statConfig.updateConfig('chartType', item.value)"
                >
                  <Icon
                    :name="item.icon"
                    :size="16"
                  />
                  {{ item.label }}
                </UiTabsItem1>
              </UiTabs1>
            </div>
          </div>
        </div>

        <!-- Showed wallets -->
        <div
          v-if="props.isShowWallets"
          class="border-b border-item-3 pb-3"
        >
          <UiTitleOption class="pb-2">
            {{ t('stat.config.wallets.title') }}
          </UiTitleOption>
          <UiCheckbox
            :checkboxValue="statConfig.config.value.wallets.isShow"
            :title="t('stat.config.wallets.label')"
            @click="statConfig.updateConfig('wallets', { isShow: !statConfig.config.value.wallets.isShow })"
          />

          <div
            v-if="statConfig.config.value.wallets.isShow"
            class="flex gap-4 pt-2"
          >
            <div class="flex gap-1">
              <UiItem4
                :class="[{
                  '!hocus:transparent opacity-30': statConfig.config.value.wallets.count === 1,
                }]"
                @click="updateWalletsLimit(statConfig.config.value.wallets.count - 1)"
              >
                <Icon name="lucide:minus" />
              </UiItem4>
              <UiFormInput
                :placeholder="t('stat.config.showedWallets.placeholder')"
                :value="statConfig.config.value.wallets.count"
                :max="walletsStore.sortedIds.length"
                min="1"
                class="max-w-20 !px-2 text-center"
                type="number"
                @updateValue="value => statConfig.updateConfig('wallets', { count: +value })"
              />

              <UiItem4
                :class="{ '!hocus:transparent opacity-30': statConfig.config.value.wallets.count >= walletsStore.sortedIds.length }"
                @click="updateWalletsLimit(statConfig.config.value.wallets.count + 1)"
              >
                <Icon name="lucide:plus" />
              </UiItem4>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div>
          <UiTitleOption class="pb-2">
            {{ t('statistics.title') }}
          </UiTitleOption>

          <UiCheckbox
            :checkboxValue="statConfig.config.value.date.isShowQuick"
            :title="t('stat.config.date.quick.label')"
            @click="statConfig.updateConfig('date', { isShowQuick: !statConfig.config.value.date.isShowQuick })"
          />
        </div>

        <slot />
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
