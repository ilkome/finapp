<script setup lang="ts">
import { usePointerClass } from '~/components/layout/usePointerClass'

import '~/assets/css/fullpage.css'
import '~/assets/css/reset.css'
import '~/assets/stylus/index.styl'

const { pointerClasses } = usePointerClass()

useHead({
  bodyAttrs: {
    class: pointerClasses,
  },
  htmlAttrs: {
    lang: useI18n().locale.value,
  },
})
</script>

<template>
  <NuxtPwaManifest />
  <div class="layoutBase">
    <NuxtPage />
    <slot />
  </div>
</template>
