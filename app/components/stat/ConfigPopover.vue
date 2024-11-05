<script setup lang="ts">
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import type { MiniItemConfig } from '~/components/stat/types'
import { chartViewOptions } from '~/components/stat/types'

const props = defineProps<{
  config: MiniItemConfig
  isShowWallets?: boolean
}>()

const emit = defineEmits<{
  updateConfig: [key: keyof MiniItemConfig, value: MiniItemConfig[keyof MiniItemConfig]]
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()
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

        <!-- Chart view -->
        <div class="popover-el hidden md:block">
          <UiTitle3 class="pb-2">
            {{ t("stat.config.chartView.label") }}
          </UiTitle3>
          <UiTabs>
            <UiTabsItem
              v-for="view in chartViewOptions"
              :key="view"
              :isActive="config.chartView === view"
              @click="emit('updateConfig', 'chartView', view)"
            >
              {{ t(`stat.config.chartView.${view}`) }}
            </UiTabsItem>
          </UiTabs>
        </div>

        <!-- Chart show -->
        <div class="popover-el">
          <UiTitle3 class="pb-2">
            {{ t("stat.config.chartShow.label") }}
          </UiTitle3>
          <UiCheckbox
            :checkboxValue="props.config.chartShow"
            :title="t('stat.config.chartShow.label')"
            @onClick="emit('updateConfig', 'chartShow', !props.config.chartShow)"
          />
        </div>

        <!-- Showed wallets -->
        <div v-if="props.isShowWallets" class="popover-el">
          <UiTitle3 class="pb-2">
            {{ t("stat.config.showedWallets.label") }}
          </UiTitle3>

          <UiFormInput
            :placeholder="t('stat.config.showedWallets.placeholder')"
            :value="config.showedWallets"
            type="number"
            min="0"
            :max="walletsStore.sortedIds.length"
            @updateValue="value => emit('updateConfig', 'showedWallets', +value)"
          />
        </div>
      </div>
    </template>
  </UPopover>
</template>
