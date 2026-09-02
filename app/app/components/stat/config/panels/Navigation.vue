<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="grid gap-0.5">
    <StatConfigSwitch
      path="date.isPinned"
      :title="t('stat.config.navigation.pin')"
    />
    <StatConfigSwitch
      path="date.isShowNavigation"
      :title="t('stat.config.navigation.showButtons')"
    />
  </div>
</template>
