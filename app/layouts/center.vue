<script setup lang="ts">
import { usePointerClass } from '~/components/layout/usePointerClass'
import { useGuard } from '~/components/user/useGuard'

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

useGuard()
</script>

<template>
  <NuxtPwaManifest />

  <div class="layoutBase">
    <NuxtPage />
  </div>
</template>
