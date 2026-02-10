<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="font-brand first-letter:text-primary text-2xl font-bold">
    {{ t('appName') }}
  </div>
</template>
