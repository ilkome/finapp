<script setup lang="ts">
import detectTouch from '~/assets/js/isTouchDevice'
const { $store } = useNuxtApp()

// Detect touch device
const isTouchDevice = ref(false)
onMounted(() => { isTouchDevice.value = detectTouch() })
const touchClassNames = computed(() => ({
  isNotTouchDevice: !isTouchDevice.value,
  isTouchDevice: isTouchDevice.value,
}))
</script>

<template lang="pug">
.overflow-hidden.flex.h-full.min-w-base.font-roboto.text-gray-600.dark_text-gray-400.antialiased.leading-none.bg-neutral-100.dark_bg-dark3(
  :class="touchClassNames"
)
  transition(name="fadeInSlow" appear)
    Nuxt

  Notifications(
    :position="$store.state.ui.mobile ? 'top center' : 'top left'"
    :width="$store.state.ui.mobile ? '94%' : '380px'"
    classes="notifications"
  )
</template>
