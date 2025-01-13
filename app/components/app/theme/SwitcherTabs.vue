<script setup lang="ts">
const props = defineProps<{
  isShowPink?: boolean
  isShowSystem?: boolean
}>()

const colorMode = useColorMode()
const { t } = useI18n()

type Theme = 'system' | 'light' | 'dark'

const locales: {
  localeKey: string
  slug: Theme
}[] = [{
  localeKey: 'theme.light',
  slug: 'light',
}, {
  localeKey: 'theme.dark',
  slug: 'dark',
}] as const

if (props.isShowPink) {
  locales.push({
    localeKey: 'theme.pink',
    slug: 'pink',
  })
}

if (props.isShowSystem) {
  locales.unshift({
    localeKey: 'theme.system',
    slug: 'system',
  })
}

function setTheme(theme: Theme) {
  colorMode.preference = theme
}

function isItActive(theme: Theme) {
  return colorMode.preference === theme
}
</script>

<template>
  <UiTabs2>
    <UiTabsItem4
      v-for="locale in locales"
      :key="locale.slug"
      :isActive="isItActive(locale.slug)"
      @click="setTheme(locale.slug)"
    >
      {{ t(locale.localeKey) }}
    </UiTabsItem4>
  </UiTabs2>
</template>

<i18n lang="yaml">
en:
  theme:
    change: 'Change theme'
    dark: 'Dark'
    light: 'Light'
    pink: 'Pink'
    select: 'Select theme'
    system: 'System'

ru:
  theme:
    change: 'Сменить тему'
    dark: 'Темная'
    light: 'Светлая'
    pink: 'Розовая'
    select: 'Выберите тему'
    system: 'Авто'
</i18n>
