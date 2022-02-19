<script lang="ts">
import detectTouch from '~/assets/js/isTouchDevice'

export default defineComponent({
  setup() {
    // Detect touch device
    const isTouchDevice = ref(false)
    onMounted(() => { isTouchDevice.value = detectTouch() })

    const touchClassNames = computed(() => ({
      isNotTouchDevice: !isTouchDevice.value,
      isTouchDevice: isTouchDevice.value,
    }))

    return {
      touchClassNames,
    }
  },
})
</script>

<template lang="pug">
.font-roboto.text-gray-600.antialiased.leading-none.bg-neutral-100.flex.h-full.min-w-base(
  :class="[{ ...touchClassNames }, 'dark:text-gray-400 dark:bg-dark3']"
)
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
@import '~assets/stylus/base/animations'
@import '~assets/stylus/colors-light'
@import '~assets/stylus/colors-dark'
</style>
