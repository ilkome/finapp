<script lang="ts">
import { ref, onMounted, defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  setup () {
    const documentHeight = ref('100%')
    onMounted(() => {
      documentHeight.value = `${document.documentElement.clientHeight}px`
    })
    return {
      documentHeight
    }
  }
})
</script>

<template lang="pug">
Portal(to="modal")
  BaseBottomSheet(
    :show="true"
    @closed="$emit('closed')"
  )
    template(#handler="{ close }")
      .handler

      .handler__close(@click="close")
        svg(
          viewBox='0 0 24 24'
          fill='none'
          stroke='#000'
          stroke-linecap='round'
          stroke-linejoin='round'
          stroke-width='1.5'
        )
          path(d='M.75 23.249l22.5-22.5')
          path(d='M23.25 23.249L.75.749')

    template(#default="{ close }")
      .content(:style="{ maxHeight: documentHeight }")
        .header(@click="close")
          slot(name="header")

        slot(name="default" :close="close")
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.handler
  z-index 2
  position absolute
  top 0
  left 0
  display flex
  align-items center
  justify-content center
  width 100%
  height 16px

  &:after
    content ''
    display block
    width 32px
    height 4px
    background var(--c-bg-8)
    border-radius 4px

  &__close
    z-index 3
    cursor pointer
    position absolute
    top 4px
    right 4px
    display flex
    align-items center
    justify-content center
    width 40px
    height 40px
    border-radius 50%
    anim()

    +media-hover()
      background var(--c-blue-1)

    svg
      anim()
      width 12px
      height 12px
      stroke var(--c-font-4)

    +media-hover()
      svg
        width 12px
        height 12px
        stroke var(--c-font-1)

.content
  overflow hidden
  display grid
  grid-template-rows minmax(min-content, auto) minmax(50px, min-content)
  padding-top $m7
  background var(--color-bg-canvas)
  border-radius $m8 $m8 0 0

.header
  position relative
  display flex
  align-items center
  justify-content center
  padding $m7
  padding-bottom $m7
  color var(--c-font-3)
  font-size 22px
  font-weight 700
  letter-spacing 1px
  fontFamilyNunito()

  /.light-mode &
    color var(--c-font-4)
</style>
