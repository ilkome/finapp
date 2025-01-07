<script setup lang="ts">
import '~/assets/css/theme.css'
import '~/assets/css/tailwind.css'
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
    <NuxtPage />
  </div>
</template>
