<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

const { height } = useWindowSize()
</script>

<template lang="pug">
Portal(to="modal")
  BaseBottomSheet(
    insideClass="sm_rounded-b-2xl bg-layout-main"
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
      .pt-3.pb-3.px-3.bg-layout-main.rounded-t-2xl
        UiTitle
          slot(name="header")

    template(#default="{ close }")
      slot(name="default" :close="close")
</template>
