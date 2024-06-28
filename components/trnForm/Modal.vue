<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

const { height } = useWindowSize()
</script>

<template>
  <Teleport to="body">
    <BaseBottomSheet2
      drugClassesCustom="bg-item-4 sm:rounded-b-2xl"
      isShow
      :maxHeight="height"
      @closed="$emit('closed')"
    >
      <template #handler="{ close }">
        <BaseBottomSheetHandler />
        <BaseBottomSheetClose @onClick="close" />
      </template>

      <template #default="{ close }">
        <div class="rounded-t-2xl bg-foreground-3 px-3 pb-3 pt-3">
          <UiTitle>
            <slot name="header" />
          </UiTitle>
        </div>
        <slot name="default" :close="close" />
      </template>
    </BaseBottomSheet2>
  </Teleport>
</template>
