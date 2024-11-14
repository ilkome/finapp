<script setup lang="ts">
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { chartViewOptions } from '~/components/stat/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'

const props = defineProps<{
  isShowWallets?: boolean
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()
const statConfig = inject('statConfig') as StatConfigProvider
</script>

<template>
  <UPopover
    :popper="{ placement: 'bottom-end' }"
    class="ml-auto"
  >
    <UiItem3>
      <Icon name="lucide:settings-2" class="size-5" />
    </UiItem3>

    <template #panel="{ close }">
      <div class="grid gap-6 p-5">
        <BaseBottomSheetClose @click="close" />

        <!-- Chart show -->
        <div class="popover-el">
          <UiTitle3 class="pb-2">
            {{ t("stat.config.chartShow.title") }}
          </UiTitle3>
          <UiCheckbox
            :checkboxValue="statConfig.config.value.chartShow"
            :title="t('stat.config.chartShow.label')"
            @onClick="statConfig.updateConfig('chartShow', !statConfig.config.value.chartShow)"
          />
        </div>

        <!-- Chart view -->
        <div
          v-if="statConfig.config.value.chartShow"
          class="popover-el hidden md:block"
        >
          <UiTitle66 class="pb-2">
            {{ t("stat.statConfig.config.value.chartView.label") }}
          </UiTitle66>

          <UiTabs1>
            <UiTabsItem1
              v-for="view in chartViewOptions"
              :key="view"
              :isActive="statConfig.config.value.chartView === view"
              @click="statConfig.updateConfig('chartView', view)"
            >
              {{ t(`stat.statConfig.config.value.chartView.${view}`) }}
            </UiTabsItem1>
          </UiTabs1>
        </div>

        <!-- Showed wallets -->
        <div v-if="props.isShowWallets" class="popover-el">
          <UiTitle3 class="pb-2">
            {{ t("stat.statConfig.config.value.showedWallets.label") }}
          </UiTitle3>

          <UiFormInput
            :placeholder="t('stat.statConfig.config.value.showedWallets.placeholder')"
            :value="statConfig.config.value.showedWallets"
            :max="walletsStore.sortedIds.length"
            class="max-w-20"
            type="number"
            min="0"
            @updateValue="value => statConfig.updateConfig('showedWallets', +value)"
          />
        </div>
      </div>
    </template>
  </UPopover>
</template>
