<script setup lang="ts">
defineProps<{
  chip?: string
  icon?: string
  label: string
  selected?: boolean
}>()
</script>

<template>
  <UButton
    size="sm"
    color="neutral"
    variant="outline"
    :icon="icon"
    :label="label"
    class="capitalize ring-(--ui-border) rounded-[calc(var(--ui-radius))] text-[11px]"
    :class="[selected ? 'bg-elevated' : 'hover:bg-elevated/50']"
  >
    <template v-if="chip" #leading>
      <slot name="leading">
        <span
          class="inline-block size-2 rounded-full bg-(--color-light) dark:bg-(--color-dark)"
          :style="{
            '--color-light': `var(--color-${chip}-500)`,
            '--color-dark': `var(--color-${chip}-400)`,
          }"
        />
      </slot>
    </template>
  </UButton>
</template>
