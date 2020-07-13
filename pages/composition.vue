<script>
import { ref } from 'nuxt-composition-api'
import useTouchClose from '~/composables/useTouchClose'

export default {
  name: 'CompositionPage',

  setup () {
    const scrollContainer = ref(null)
    const scrollContent = ref(null)
    const scrollOverflow = ref(null)
    const scrollWrapper = ref(null)

    const { close } = useTouchClose({
      container: scrollContainer,
      content: scrollContent,
      overflow: scrollOverflow,
      wrapper: scrollWrapper
    })

    return {
      scrollContainer,
      scrollContent,
      scrollOverflow,
      scrollWrapper,
      closeModal: close
    }
  }
}
</script>

<template lang="pug">
div
  n-link(to="/") CompositionPage

  h1(@click="close") close

  div.scroll(ref="scrollContainer")
    .scroll__overflow(ref="scrollOverflow") overflow
    .scroll__wrapper(ref="scrollWrapper") wrapper
      .scroll__content(ref="scrollContent") content

</template>

<style lang="stylus" scoped>
.scroll
  height 400px
  background gray

  &__wrapper
    height 100px
    background blue

  &__content
    height 50px
    background red
</style>
