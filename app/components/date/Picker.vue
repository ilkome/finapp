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
    class="datePicker w-full"
    :rows="props.rows ?? 1"
    style="width: 100%;"
    v-bind="{ ...attrs, ...$attrs, ...matchTheme[colorMode.preference] }"
  />
  <VCalendarDatePicker
    v-else
    v-model="date"
    :rows="1"
    class="datePicker w-full"
    mode="date"
    style="width: 100%;"
    v-bind="{ ...attrs, ...$attrs, ...matchTheme[colorMode.preference] }"
  />
</template>

<style>
@import '~/assets/css/main.css';

html .vc-dark,
html .vc-light {
  --vc-popover-content-bg: var(--item-1);
  --vc-accent-500: var(--ui-primary);
  --vc-focus-ring: var(--ui-primary);
  --vc-nav-item-active-bg: var(--ui-primary);
  --vc-nav-hover-bg: var(--item-5);
  --vc-color: var(--text-1);
  --vc-day-content-disabled-color: var(--text-1/.40);
  --vc-weekday-color: var(--text-(--ui-text-muted));
  --vc-header-title-color: var(--text-3);
  --vc-popover-content-color: var(--text-(--ui-text-muted));
  --vc-nav-title-color: var(--text-3);
  --vc-nav-item-current-color: var(--ui-primary);
  --vc-highlight-solid-bg: var(--ui-primary);
}

.vc-popover-content {
  @apply border-2 border-item-4;
}
</style>
