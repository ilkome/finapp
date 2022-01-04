<script>
import { ref, computed, onMounted } from '#app'
import detectTouch from '~/assets/js/isTouchDevice'

export default {
  name: 'DefaultLayout',

  setup () {
    // Detect touch device
    const isTouchDevice = ref(false)
    onMounted(() => { isTouchDevice.value = detectTouch() })

    const className = computed(() => ({
      isNotTouchDevice: !isTouchDevice.value,
      isTouchDevice: isTouchDevice.value
    }))

    return {
      className
    }
  }
}
</script>

<template lang="pug">
.flex.h-full.min-w-base(:class="className")
  template(v-if="!$store.state.app.status.ready")
    LoaderSharedLoader

  transition(name="fadeInSlow" appear)
    template(v-if="$store.state.app.status.ready")
      Nuxt

  Notifications(
    :position="$store.state.ui.mobile ? 'top center' : 'top left'"
    :width="$store.state.ui.mobile ? '94%' : '380px'"
    classes="notifications"
  )
</template>

<style lang="css">
:root {
  --height: 100vh
}
</style>

<style lang="stylus">
@import '~assets/stylus/colors-light'
@import '~assets/stylus/colors-dark'
</style>
