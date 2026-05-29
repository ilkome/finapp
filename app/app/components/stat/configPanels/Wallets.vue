<script setup lang="ts">
import { statConfigKey } from '~/components/stat/injectionKeys'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!
const walletsStore = useWalletsStore()
</script>

<template>
  <div
    class="grid gap-3 transition-opacity"
    :class="{ 'pointer-events-none opacity-50': !statConfig.config.value.wallets.isShow }"
  >
    <UiNumberStepper
      :modelValue="statConfig.config.value.wallets.count"
      :min="1"
      :max="walletsStore.sortedIds.length"
      @update:modelValue="value => statConfig.updateConfig('wallets', { count: value })"
    />

    <StatConfigSwitch
      configKey="wallets"
      field="isShowIcon"
      :title="t('stat.config.wallets.showIcon')"
    />
  </div>
</template>
