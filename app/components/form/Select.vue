<script lang="ts" setup>
const props = defineProps<{
  options: {
    label: string
    value: string
  }[]
  value: string
}>()

const emit = defineEmits<{
  change: [value: string]
}>()
</script>

<template>
  <select
    :value="props.value"
    @change="emit('change', $event.target.value)"
  >
    <option
      v-for="option in props.options"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>

<style lang="css" scoped>
select {
  appearance: none;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4MDgwODAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb25zLXVwLWRvd24iPjxwYXRoIGQ9Im03IDE1IDUgNSA1LTUiLz48cGF0aCBkPSJtNyA5IDUtNSA1IDUiLz48L3N2Zz4=');
  background-position: right 0.7rem center;
  background-repeat: no-repeat;
  background-size: 1.25em 1.25em;
  @apply hocus:bg-item-5 bg-item-3 focus:outline-none border border-transparent focus:border-accent-1 -my-px block min-h-[42px] w-full max-w-lg grow items-center gap-0 gap-x-2 overflow-hidden rounded-md px-4 pr-10 py-2 ring-0;
}
</style>
