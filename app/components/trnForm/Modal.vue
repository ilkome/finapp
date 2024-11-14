<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

const { height } = useWindowSize()
</script>

<template>
  <Teleport to="body">
    <BaseBottomSheet2
      drugClassesCustom="bg-foreground-1 sm:rounded-b-2xl"
      isShow
      :maxHeight="height"
      @closed="$emit('closed')"
    >
      <template #handler="{ close }">
        <BaseBottomSheetHandler />
        <BaseBottomSheetClose @onClick="close" />
      </template>

      <template #default="{ close }">
        <div class="bg-foreground-1 rounded-t-2xl p-3">
          <UiTitle>
            <slot name="header" />
          </UiTitle>
        </div>
        <slot name="default" :close="close" />
      </template>
    </BaseBottomSheet2>
  </Teleport>
</template>
