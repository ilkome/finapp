<script setup lang="ts">
import { useThemeOptions } from '~/components/theme/useThemeOptions'

const { neutral, neutralColors } = useThemeOptions()
</script>

<template>
  <div class="-mx-2 grid grid-cols-3 gap-1">
    <ThemePickerButton
      v-for="color in neutralColors"
      :key="color"
      :chip="color"
      :label="color"
      :selected="neutral === color"
      @click="neutral = color"
    />
  </div>
</template>
