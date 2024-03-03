<script setup lang="ts">
const colorMode = useColorMode()

type Theme = 'system' | 'light' | 'dark'

const locales: {
  slug: Theme
  localeKey: string
}[] = [{
  slug: 'system',
  localeKey: 'app.theme.system',
}, {
  slug: 'light',
  localeKey: 'app.theme.light',
}, {
  slug: 'dark',
  localeKey: 'app.theme.dark',
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
