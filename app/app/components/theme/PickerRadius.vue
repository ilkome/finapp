<script setup lang="ts">
import { useThemeOptions } from '~/components/theme/useThemeOptions'

const { radius, radiuses } = useThemeOptions()
</script>

<template>
  <!-- Two columns: four would clip the labels in the w-72 sidebar popover. -->
  <div class="-mx-2 grid grid-cols-2 gap-1">
    <ThemePickerButton
      v-for="option in radiuses"
      :key="option"
      chip="primary"
      :label="String(option)"
      :selected="radius === option"
      @click="radius = option"
    >
      <template #leading>
        <span
          class="bg-accented inline-block size-3"
          :style="{ borderRadius: `${option}rem` }"
        />
      </template>
    </ThemePickerButton>
  </div>
</template>
