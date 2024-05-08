<script setup lang="ts">
const colorMode = useColorMode()

type Theme = 'system' | 'light' | 'dark'

const locales: {
  localeKey: string
  slug: Theme
}[] = [{
  localeKey: 'app.theme.system',
  slug: 'system',
}, {
  localeKey: 'app.theme.light',
  slug: 'light',
}, {
  localeKey: 'app.theme.dark',
  slug: 'dark',
}] as const

function setTheme(theme: Theme) {
  colorMode.preference = theme
}

function isItActive(theme: Theme) {
  return colorMode.preference === theme
}
</script>

<template>
  <UiTabs2>
    <UiTabsItem2
      v-for="locale in locales"
      :key="locale.slug"
      :isActive="isItActive(locale.slug)"
      @click="setTheme(locale.slug)"
    >
      {{ $t(locale.localeKey) }}
    </UiTabsItem2>
  </UiTabs2>
</template>
