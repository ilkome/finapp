<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="grid gap-0.5">
    <StatConfigSwitch
      path="summary.isPinned"
      :title="t('stat.config.summary.pin')"
    />
    <StatConfigSwitch
      path="summary.isShowChart"
      :title="t('stat.config.summary.showChart')"
    />
  </div>
</template>
