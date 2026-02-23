<script setup lang="ts">
import { useTheme } from '~/components/theme/useTheme'

const { options, preference, setTheme } = useTheme()
</script>

<template>
  <UiTabsScroll>
    <UiTabsItemPill
      v-for="theme in options"
      :key="theme.value"
      variant="outline"
      :isActive="preference === theme.value"
      @click="setTheme(theme.value)"
    >
      {{ theme.label }}
    </UiTabsItemPill>
  </UiTabsScroll>
</template>
