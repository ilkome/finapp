<script setup lang="ts">
import { usePointer } from '@vueuse/core'

import '~/assets/css/index.css'
import '~/assets/css/themes.css'
import '~/assets/css/fullpage.css'
import '~/assets/css/reset.css'

const { $store } = useNuxtApp()

// TODO: Put in one separate setup function
const { pointerType } = usePointer()
const classes = computed(() => [
  {
    mouse: pointerType.value === 'mouse' || !pointerType.value,
    touch: pointerType.value === 'touch',
  },
  `
    overflow-hidden relative
    h-full min-w-base
    font-roboto text-gray-600 dark_text-gray-400 antialiased leading-none
    bg-neutral-100 dark_bg-dark3
  `,
])
</script>

<template lang="pug">
div(:class="classes")
  Transition(name="fadeInSlow" appear)
    Nuxt

  Notifications(
    :position="$store.state.ui.mobile ? 'top center' : 'top left'"
    :width="$store.state.ui.mobile ? '94%' : '380px'"
    classes="notifications"
  )
</template>
