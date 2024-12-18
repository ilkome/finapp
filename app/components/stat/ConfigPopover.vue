<script setup lang="ts">
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { chartViewOptions } from '~/components/stat/useStatConfig'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import { getStyles } from '~/components/ui/getStyles'

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
</script>

<template>
  <UiHeaderConfigPopover>
    <!-- Chart show -->
    <div class="popover-el">
      <UiTitleOption class="pb-2">
        {{ t("stat.config.chartShow.title") }}
      </UiTitleOption>
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

    <!-- Showed wallets -->
    <div v-if="props.isShowWallets" class="popover-el">
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

    <slot />
  </UiHeaderConfigPopover>
</template>
