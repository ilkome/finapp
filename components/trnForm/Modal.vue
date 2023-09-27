<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

const { height } = useWindowSize()
</script>

<template lang="pug">
Portal(to="modal")
  BaseBottomSheet(
    insideClass="sm_rounded-b-2xl bg-skin-layout-main"
    show
    :maxHeight="height"
    @closed="$emit('closed')"
  )
    template(#handler="{ close }")
      BaseBottomSheetHandler
      BaseBottomSheetClose(@onClick="close")

    template(
      v-if="$slots.header"
      #header
    )
      .py-4.px-3.text-center.text-skin-item-base.text-xl.font-nunito.font-semibold.bg-skin-layout-main.rounded-t-2xl
        slot(name="header")

    template(#default="{ close }")
      slot(name="default" :close="close")
</template>

<style lang="stylus" scoped>
.content
  overflow hidden
  display grid
  padding-top $m7
  background var(--c-bg-3)
  border-radius $m8 $m8 0 0

  +media(600px)
    border-radius 16px
</style>
