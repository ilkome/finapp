<script setup lang="ts">
import { swatchPalette } from '~/components/theme/useThemeOptions'

const { chip } = defineProps<{
  chip?: string
  icon?: string
  label: string
  selected?: boolean
}>()

const palette = computed(() => chip ? swatchPalette(chip) : undefined)
</script>

<template>
  <UButton
    size="sm"
    color="neutral"
    variant="outline"
    :icon="icon"
    :label="label"
    class="ring-default rounded-sm text-[11px] capitalize"
    :class="[selected ? 'bg-elevated' : 'hover:bg-elevated/50']"
  >
    <template v-if="chip" #leading>
      <slot name="leading">
        <span
          class="inline-block size-2 rounded-full bg-(--color-light) dark:bg-(--color-dark)"
          :style="{
            '--color-light': `var(--color-${palette}-500)`,
            '--color-dark': `var(--color-${palette}-400)`,
          }"
        />
      </slot>
    </template>
  </UButton>
</template>
