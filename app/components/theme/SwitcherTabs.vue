<script setup lang="ts">
import { useTheme } from '~/components/theme/useTheme'

const { options, preference, setTheme } = useTheme()
</script>

<template>
  <UiTabs2>
    <UiTabsItem4
      v-for="theme in options"
      :key="theme.value"
      :isActive="preference === theme.value"
      @click="setTheme(theme.value)"
    >
      {{ theme.label }}
    </UiTabsItem4>
  </UiTabs2>
</template>
