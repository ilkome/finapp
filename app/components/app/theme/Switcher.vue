<script setup lang="ts">
const props = withDefaults(defineProps<{
  component?: 'UiTabs3' | 'UiTabs2'
  isShowSystem?: boolean
}>(), {
  component: 'UiTabs3',
})

const colorMode = useColorMode()
const { t } = useI18n()

type Theme = 'system' | 'light' | 'dark'

const locales: {
  localeKey: string
  slug: Theme
}[] = [{
  localeKey: 'app.theme.light',
  slug: 'light',
}, {
  localeKey: 'app.theme.dark',
  slug: 'dark',
}] as const

if (props.isShowSystem) {
  locales.unshift({
    localeKey: 'app.theme.system',
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
  <Component :is="props.component">
    <UiTabsItem4
      v-for="locale in locales"
      :key="locale.slug"
      :isActive="isItActive(locale.slug)"
      @click="setTheme(locale.slug)"
    >
      {{ t(locale.localeKey) }}
    </UiTabsItem4>
  </Component>
</template>
