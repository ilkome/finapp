<script setup lang="ts">
import { walletDisplayModes, walletSelectionModes } from '~/components/stat/config/schema'
import { statConfigKey } from '~/components/stat/injectionKeys'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!
const walletsStore = useWalletsStore()
const displayModeItems = computed(() => walletDisplayModes.map(value => ({
  label: t(`stat.config.wallets.displayModes.${value}`),
  value,
})))
const selectionModeItems = computed(() => walletSelectionModes.map(value => ({
  label: t(`stat.config.wallets.selectionModes.${value}`),
  value,
})))
</script>

<template>
  <div
    class="flex flex-col gap-0.5"
  >
    <StatConfigFieldRow parameterId="wallets.displayMode" :title="t('stat.config.wallets.displayMode')">
      <USelect
        class="w-40 shrink-0"
        :aria-label="t('stat.config.wallets.displayMode')"
        :content="{ position: 'item-aligned' }"
        :items="displayModeItems"
        :modelValue="statConfig.config.value.wallets.displayMode"
        :ui="{ content: 'z-[60]' }"
        @update:modelValue="value => statConfig.updateConfig('wallets', { displayMode: value as typeof walletDisplayModes[number] })"
      />
    </StatConfigFieldRow>

    <StatConfigFieldRow
      v-if="statConfig.config.value.wallets.displayMode === 'recent'"
      parameterId="wallets.count"
      :title="t('stat.config.wallets.count')"
    >
      <UiNumberStepper
        :modelValue="statConfig.config.value.wallets.count"
        :min="1"
        :max="walletsStore.sortedIds.length"
        @update:modelValue="value => statConfig.updateConfig('wallets', { count: value })"
      />
    </StatConfigFieldRow>

    <StatConfigFieldRow parameterId="wallets.selectionMode" :title="t('stat.config.wallets.selectionMode')">
      <USelect
        class="w-40 shrink-0"
        :aria-label="t('stat.config.wallets.selectionMode')"
        :content="{ position: 'item-aligned' }"
        :items="selectionModeItems"
        :modelValue="statConfig.config.value.wallets.selectionMode"
        :ui="{ content: 'z-[60]' }"
        @update:modelValue="value => statConfig.updateConfig('wallets', { selectionMode: value as typeof walletSelectionModes[number] })"
      />
    </StatConfigFieldRow>

    <StatConfigSwitch
      path="wallets.isShowIcon"
      :title="t('stat.config.wallets.showIcon')"
    />
  </div>
</template>
