<script setup lang="ts">
const props = defineProps<{
  isShowTitle?: boolean
}>()

const colorMode = useColorMode()
const { t } = useI18n()

type Theme = 'system' | 'light' | 'dark' | 'pink'

const options: {
  label: string
  value: Theme
}[] = [{
  label: t('theme.system'),
  value: 'system',
}, {
  label: t('theme.light'),
  value: 'light',
}, {
  label: t('theme.dark'),
  value: 'dark',
}, {
  label: t('theme.pink'),
  value: 'pink',
}] as const

function setTheme(theme: Theme) {
  colorMode.preference = theme
}
</script>

<template>
  <div>
    <UiTitle3
      v-if="props.isShowTitle"
      class="pb-2"
    >
      {{ t('theme.title') }}
    </UiTitle3>

    <FormSelect
      :options
      :value="colorMode.preference"
      @change="(theme: Theme) => setTheme(theme)"
    />
  </div>
</template>

<i18n lang="yaml">
en:
  theme:
    dark: 'Dark'
    light: 'Light'
    pink: 'Pink'
    title: 'Theme'
    system: 'System'

ru:
  theme:
    dark: 'Темная'
    light: 'Светлая'
    pink: 'Розовая'
    title: 'Тема'
    system: 'Авто'
</i18n>
