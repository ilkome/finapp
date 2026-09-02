<script setup lang="ts">
import { statConfigKey } from '~/components/stat/injectionKeys'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!
const isHistoryAvailable = computed(() => statConfig.config.value.page.blockOrder.at(-1) === 'trns')
</script>

<template>
  <div class="grid gap-0.5">
    <StatConfigSwitch
      path="trns.isShowTitle"
      :title="t('stat.config.trns.showTitle')"
    />
    <StatConfigSwitch
      path="trns.isShowTypeTabs"
      :title="t('stat.config.trns.showTypeTabs')"
    />
    <StatConfigSwitch
      :disabled="!isHistoryAvailable"
      path="trns.isShowHistory"
      :title="t('stat.config.trns.showHistory')"
    />
  </div>
</template>
