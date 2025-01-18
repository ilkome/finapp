<script setup lang="ts">
import { DatePicker as VCalendarDatePicker } from 'v-calendar'
import 'v-calendar/style.css'

type DatePickerDate = number | string | Date | null | {
  end?: number | string | Date | null
  start?: number | string | Date | null
}

const props = defineProps<{
  mode?: 'date' | 'range'
  rows?: number
  value: DatePickerDate
}>()

const emit = defineEmits(['update:model-value', 'close'])
const colorMode = useColorMode()

const date = computed({
  get: () => props.value,
  set: (value) => {
    emit('update:model-value', value)
    emit('close')
  },
})

const attrs = {
  'borderless': true,
  'first-day-of-week': 2,
  'transparent': true,
}

const matchTheme = {
  'dark': {
    color: 'pink',
    isDark: true,
  },
  'dark-blue': {
    color: 'blue',
    isDark: true,
  },
  'dark-pink': {
    color: 'pink',
    isDark: true,
  },
  'light': {
    color: 'pink',
    isDark: false,
  },
  'light-blue': {
    color: 'blue',
    isDark: false,
  },
  'light-pink': {
    color: 'pink',
    isDark: false,
  },
  'system': {
    color: 'pink',
    isDark: colorMode.value === 'dark',
  },
}
</script>

<template>
  <VCalendarDatePicker
    v-if="props.mode === 'range'"
    v-model.range="date"
    class="datePicker"
    :rows="props.rows ?? 1"
    v-bind="{ ...attrs, ...$attrs, ...matchTheme[colorMode.preference] }"
  />
  <VCalendarDatePicker
    v-else
    v-model="date"
    :rows="1"
    class="datePicker"
    mode="date"
    v-bind="{ ...attrs, ...$attrs, ...matchTheme[colorMode.preference] }"
  />
</template>

<style>
html .vc-dark,
html .vc-light {
  --vc-popover-content-bg: theme('colors.item.1');
  --vc-accent-500: theme('colors.accent.1');
  --vc-focus-ring: theme('colors.accent.1');
  --vc-nav-item-active-bg: theme('colors.accent.1');
  --vc-nav-hover-bg: theme('colors.item.5');
  --vc-color: theme('colors.1');
  --vc-day-content-disabled-color: theme('colors.1/.40');
  --vc-weekday-color: theme('colors.2');
  --vc-header-title-color: theme('colors.3');
  --vc-popover-content-color: theme('colors.2');
  --vc-nav-title-color: theme('colors.3');
  --vc-nav-item-current-color: theme('colors.accent.1');
  --vc-highlight-solid-bg: theme('colors.accent.1');
}

.vc-popover-content {
  @apply border-2 border-item-4;
}
</style>
