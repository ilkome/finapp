<script setup lang="ts">
import type { StatConfigProvider } from '~/components/stat/useStatConfig'

import { chartViewOptions } from '~/components/stat/useStatConfig'
import { getStyles } from '~/components/ui/getStyles'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  isShowWallets?: boolean
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()
const statConfig = inject('statConfig') as StatConfigProvider

function updateWalletsLimit(value: number) {
  if (value <= walletsStore.sortedIds.length && value > 0)
    statConfig.updateConfig('wallets', { count: value })
}

const isShow = ref(false)
</script>

<template>
  <BottomSheetOrDropdown
    :title="t('stat.config.menu.label')"
    :isOpen="isShow"
    @onOpenModal="isShow = true"
    @onCloseModal="isShow = false"
  >
    <template #trigger>
      <UiItem3>
        <Icon name="lucide:settings-2" size="20" />
      </UiItem3>
    </template>

    <template #content="{ close }">
      <div class="grid gap-6 p-3">
        <BottomSheetClose @click="close" />
        <slot />

        <!-- Chart show -->
        <div class="grid gap-2">
          <div>
            <UiTitleOption class="pb-2">
              {{ t("stat.config.chartShow.title") }}
            </UiTitleOption>
            <UiCheckbox
              :checkboxValue="statConfig.config.value.chartShow"
              :title="t('stat.config.chartShow.label')"
              @onClick="statConfig.updateConfig('chartShow', !statConfig.config.value.chartShow)"
            />
          </div>

          <template v-if="statConfig.config.value.chartShow">
            <div>
              <UiCheckbox
                :checkboxValue="statConfig.config.value.chart.isShowAverage ?? false"
                :title="t('stat.config.chart.average.label')"
                @onClick="statConfig.updateConfig('chart', { isShowAverage: !statConfig.config.value.chart.isShowAverage })"
              />
            </div>

            <div
              class="hidden md:block"
            >
              <UiTitleOption class="pb-2">
                {{ t("stat.config.chartView.label") }}
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
          </template>
        </div>

        <!-- Showed wallets -->
        <div v-if="props.isShowWallets">
          <UiTitleOption class="pb-2">
            {{ t("stat.config.wallets.title") }}
          </UiTitleOption>
          <UiCheckbox
            :checkboxValue="statConfig.config.value.wallets.isShow"
            :title="t('stat.config.wallets.label')"
            @onClick="statConfig.updateConfig('wallets', { isShow: !statConfig.config.value.wallets.isShow })"
          />

          <div
            v-if="statConfig.config.value.wallets.isShow"
            class="flex gap-4 pt-2"
          >
            <div class="flex gap-1">
              <UiItem3
                :class="[getStyles('item', ['bg2', 'minw2']), { '!hocus:transparent opacity-30': statConfig.config.value.wallets.count === 1 }]"
                @click="updateWalletsLimit(statConfig.config.value.wallets.count - 1)"
              >
                <Icon name="lucide:minus" />
              </UiItem3>
              <UiFormInput
                :placeholder="t('stat.config.showedWallets.placeholder')"
                :value="statConfig.config.value.wallets.count"
                :max="walletsStore.sortedIds.length"
                min="1"
                class="max-w-20 text-center"
                type="number"
                @updateValue="value => statConfig.updateConfig('wallets', { count: +value })"
              />

              <UiItem3
                :class="[getStyles('item', ['bg2', 'minw2']), { '!hocus:transparent opacity-30': statConfig.config.value.wallets.count >= walletsStore.sortedIds.length }]"
                @click="updateWalletsLimit(statConfig.config.value.wallets.count + 1)"
              >
                <Icon name="lucide:plus" />
              </UiItem3>
            </div>
          </div>
        </div>

        <div>
          <UiCheckbox
            :checkboxValue="statConfig.config.value.date.isShowQuick"
            :title="t('stat.config.date.quick.label')"
            @onClick="statConfig.updateConfig('date', { isShowQuick: !statConfig.config.value.date.isShowQuick })"
          />
        </div>

        <slot />
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
