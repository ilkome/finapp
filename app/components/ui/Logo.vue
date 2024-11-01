<script setup lang="ts">
const { locale } = useI18n()
const logoSrc = computed(() => `/logo-${locale.value}.svg`)
</script>

<template>
  <div class="font-tertiary font-bold text-2xl first-letter:text-accent-1">
    {{ $t('appName') }}
  </div>
  <!-- <img :src="logoSrc" :alt="$t('appName')" :title="$t('appName')"> -->
</template>
