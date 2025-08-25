<script setup lang="ts">
import colors from 'tailwindcss/colors'

import { useGuard } from '~/components/user/useGuard'

const appConfig = useAppConfig()
const colorMode = useColorMode()
const { t } = useI18n()
const toaster = {
  position: 'top-left',
  progress: false,
}

const color = computed(() => colorMode.value === 'dark' ? (colors as any)[appConfig.ui.colors.neutral][900] : 'white')
const blackAsPrimary = computed(() => appConfig.theme.blackAsPrimary ? `:root { --ui-primary: black; } .dark { --ui-primary: #ededed; }` : ':root {}')
const radius = computed(() => `:root { --ui-radius: ${appConfig.theme.radius || '0.375'}rem; }`)

useHead({
  htmlAttrs: {
    lang: useI18n().locale.value,
  },
  link: [
    { href: '/favicon.png', rel: 'icon', type: 'image/png' },
    { href: '/favicon.svg', rel: 'icon', type: 'image/svg+xml' },
  ],
  meta: [
    { charset: 'utf-8' },
    { content: 'width=device-width, initial-scale=1, viewport-fit=cover', name: 'viewport' },
    { content: color, key: 'theme-color', name: 'theme-color' },
  ],
  noscript: [{ innerHTML: 'This website requires JavaScript.' }],
  style: [
    { id: 'nuxt-ui-black-as-primary', innerHTML: blackAsPrimary, tagPriority: -2 },
    { id: 'nuxt-ui-radius', innerHTML: radius, tagPriority: -2 },
  ],
})

useSeoMeta({
  description: t('app.desc'),
  ogDescription: t('app.desc'),
  ogTitle: (chunk?: string) => chunk ? `${chunk} - ${t('appName')}` : t('appName'),
  titleTemplate: (chunk?: string) => chunk ? `${chunk} - ${t('appName')}` : t('appName'),
})

useGuard()
</script>

<template>
  <UApp :toaster="toaster">
    <NuxtLoadingIndicator :height="2" color="var(--ui-primary)" />
    <NuxtPwaManifest />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
