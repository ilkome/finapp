<script setup lang="ts">
import { statHistoryAvailableKey } from '~/components/stat/injectionKeys'

const { t } = useI18n()
const isHistoryAvailable = inject(statHistoryAvailableKey, computed(() => true))
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
      v-if="isHistoryAvailable"
      path="trns.isShowHistory"
      :title="t('stat.config.trns.showHistory')"
    />
  </div>
</template>
