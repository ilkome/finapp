<script setup lang="ts">
import '~/assets/css/theme.css'
import '~/assets/css/tailwind.css'

import { Analytics } from '@vercel/analytics/nuxt'
import { SpeedInsights } from '@vercel/speed-insights/vue'

import { usePointerClass } from '~/components/layout/usePointerClass'
import { useGuard } from '~/components/user/useGuard'

const { pointerClasses } = usePointerClass()

useHead({
  bodyAttrs: {
    class: pointerClasses,
  },
  htmlAttrs: {
    lang: useI18n().locale.value,
  },
})

useGuard()
</script>

<template>
  <div class="layoutBase">
    <NuxtPwaManifest />
    <SpeedInsights />
    <Analytics />

    <NuxtPage />
  </div>
</template>
