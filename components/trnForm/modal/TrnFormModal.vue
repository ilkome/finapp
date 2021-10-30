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
    show
    @closed="$emit('closed')"
  )
    template(#handler="{ close }")
      .handler
      BaseBottomSheetClose(@onClick="close")

    template(#default="{ close }")
      .content(
        :class="{ _withHeader: $slots.header }"
        :style="{ maxHeight: documentHeight }"
      )
        .header(v-if="$slots.header")
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

.content
  overflow hidden
  display grid
  padding-top $m7
  background var(--color-bg-canvas)
  border-radius $m8 $m8 0 0

  +media(600px)
    border-radius 16px

  &._withHeader
    grid-template-rows minmax(min-content, auto) minmax(50px, min-content)

.header
  position relative
  display flex
  align-items center
  justify-content center
  padding $m7
  padding-top $m4
  padding-bottom $m8
  color var(--c-font-3)
  font-size 22px
  font-weight 700
  letter-spacing 1px
  fontFamilyNunito()

  /.light-mode &
    color var(--c-font-4)
</style>
