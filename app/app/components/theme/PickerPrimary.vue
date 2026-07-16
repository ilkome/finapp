<script setup lang="ts">
import { useThemeOptions } from '~/components/theme/useThemeOptions'

const { blackAsPrimary, primary, primaryColors, setBlackAsPrimary } = useThemeOptions()
</script>

<template>
  <div class="-mx-2 grid grid-cols-3 gap-1">
    <ThemePickerButton
      chip="primary"
      label="Black"
      :selected="blackAsPrimary"
      @click="setBlackAsPrimary(true)"
    >
      <template #leading>
        <span class="inline-block size-2 rounded-full bg-black dark:bg-white" />
      </template>
    </ThemePickerButton>

    <ThemePickerButton
      v-for="color in primaryColors"
      :key="color"
      :chip="color"
      :label="color"
      :selected="!blackAsPrimary && primary === color"
      @click="primary = color"
    />
  </div>
</template>
