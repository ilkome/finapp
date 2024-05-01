<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

const { height } = useWindowSize()
</script>

<template>
  <Teleport to="body">
    <BaseBottomSheet2
      class="bg-foreground-3 sm_rounded-b-2xl"
      isShow
      :maxHeight="height"
      @closed="$emit('closed')"
    >
      <template #handler="{ close }">
        <BaseBottomSheetHandler />
        <BaseBottomSheetClose @onClick="close" />
      </template>

      <template v-if="$slots.header" #header>
        <div class="rounded-t-2xl bg-foreground-3 px-3 pb-3 pt-3">
          <UiTitle>
            <slot name="header" />
          </UiTitle>
        </div>
      </template>

      <template #default="{ close }">
        <slot name="default" :close="close" />
      </template>
    </BaseBottomSheet2>
  </Teleport>
</template>
