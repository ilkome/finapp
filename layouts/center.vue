<script setup lang="ts">
import { usePointerClass } from '~/components/layout/usePointerClass'
import { useUserStore } from '~/components/user/useUser'

import '~/assets/css/fullpage.css'
import '~/assets/css/index.css'
import '~/assets/css/reset.css'
import '~/assets/css/themes.css'
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

watch(() => useUserStore().uid, (value) => {
  value
    ? useRouter().replace('/dashboard')
    : useRouter().replace('/login')
}, { immediate: true })
</script>

<template>
  <NuxtPwaManifest />
  <div class="layoutBase">
    <NuxtPage />
    <slot />
  </div>
</template>
