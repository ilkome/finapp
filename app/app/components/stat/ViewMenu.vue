<script setup lang="ts">
export type StatViewMenuOption = { description: string, icon: string, keepOpen?: boolean, label: string, value: string }
export type StatViewMenuSetting = { checked: boolean, label: string, onUpdateChecked: (value: boolean) => void }

const props = defineProps<{ label: string, modelValue: string, options: StatViewMenuOption[], settings?: StatViewMenuSetting[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const current = computed(() => props.options.find(option => option.value === props.modelValue) ?? props.options[0]!)
const optionItems = computed(() => props.options.map(option => ({
  ...option,
  active: option.value === props.modelValue,
  onSelect: (event: Event) => {
    emit('update:modelValue', option.value)
    if (option.keepOpen)
      event.preventDefault()
  },
  trailingIcon: option.value === props.modelValue ? 'i-lucide-check' : undefined,
})))
const settingItems = computed(() => props.settings?.map(setting => ({
  ...setting,
  onSelect: (event: Event) => event.preventDefault(),
  type: 'checkbox' as const,
})) ?? [])
const items = computed(() => optionItems.value.flatMap(option =>
  option.value === props.modelValue ? [option, ...settingItems.value] : [option],
))

function cycle() {
  const index = props.options.findIndex(option => option.value === props.modelValue)
  emit('update:modelValue', props.options[(index + 1) % props.options.length]!.value)
}
</script>

<template>
  <UFieldGroup class="items-center rounded-full interactive bg-elevated" size="md">
    <UTooltip :text="current.label">
      <UButton class="h-10.5 rounded-l-full rounded-r-none bg-elevated px-2.5 text-muted hover:bg-elevated/50!" :aria-label="`${label}: ${current.label}`" color="neutral" :icon="current.icon" :ui="{ leadingIcon: 'text-muted' }" variant="ghost" @click="cycle" />
    </UTooltip>
    <div aria-hidden="true" class="relative z-10 h-5 w-px shrink-0 bg-(--ui-border-muted)" />
    <UDropdownMenu :items="items" :content="{ align: 'start' }">
      <UButton class="h-10.5 rounded-l-none rounded-r-full bg-elevated px-2.5 text-muted hover:bg-elevated/50!" :aria-label="$t('base.open')" color="neutral" icon="i-lucide-chevron-down" :ui="{ leadingIcon: 'text-muted' }" variant="ghost" />
    </UDropdownMenu>
  </UFieldGroup>
</template>
