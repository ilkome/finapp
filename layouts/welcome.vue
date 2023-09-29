<script setup lang="ts">
import { usePointer } from '@vueuse/core'
import debounce from '~/utils/debounce'
import useUIView from '~/components/layout/useUIView'

const { $store } = useNuxtApp()

useLazyAsyncData('posts', async () => {
  const { initUI } = useUIView()
  await initUI()
})

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
    font-roboto text-gray-500 dark_text-gray-400 leading-none antialiased
    bg-skin-layout-main
  `,
])

/**
 * Page dimensions
 */
function getPageDimensions() {
  const width = document.documentElement.clientWidth
  const height = document.documentElement.clientHeight
  document.documentElement.style.setProperty('--height', `${height}px`)
  $store.dispatch('ui/setAppDimensions', { width, height })
}

onMounted(() => {
  getPageDimensions()
  window.addEventListener('resize', debounce(getPageDimensions, 300))
})
</script>

<template lang="pug">
div(:class="classes")
  LayoutModals

  PortalTarget(
    multiple
    name="modal"
  )

  .overflow-hidden.flex-grow.h-full.flex
    transition(name="fadeIn" appear)
      Nuxt
</template>
