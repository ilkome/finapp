<script setup lang="ts">
const { locale } = useI18n()
const logoSrc = computed(() => `/logo-${locale.value}.svg`)
</script>

<template>
  <img :src="logoSrc" :alt="$t('appName')" :title="$t('appName')">
</template>
