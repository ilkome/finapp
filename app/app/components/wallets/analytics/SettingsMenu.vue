<script setup lang="ts">
export type AnalyticsOption = {
  id: string
  items: { label: string, value: number | string }[]
  label: string
  value: number | string
}

const props = defineProps<{
  options: AnalyticsOption[]
  title: string
}>()

const emit = defineEmits<{
  change: [id: string, value: number | string]
}>()

const isOpen = ref(false)
</script>

<template>
  <DrawerOrDropdown
    v-model:open="isOpen"
    align="end"
    isShowCloseBtn
    popoverContentClass="z-[60] w-88 max-w-[calc(100vw-1rem)] overscroll-contain"
    :title="props.title"
  >
    <template #trigger>
      <UiActionButton
        :ariaLabel="props.title"
        class="size-8 min-h-8! min-w-8!"
        size="sm"
      >
        <Icon name="lucide:sliders-horizontal" size="18" />
      </UiActionButton>
    </template>

    <template #content>
      <div class="grid gap-4 pb-3 md:p-1">
        <div v-for="option in props.options" :key="option.id" class="grid gap-2">
          <UiText variant="meta" class="px-1">
            {{ option.label }}
          </UiText>
          <UiTabs
            :items="option.items"
            :modelValue="option.value"
            size="xs"
            variant="flat"
            @update:modelValue="value => emit('change', option.id, value)"
          />
        </div>
        <slot />
      </div>
    </template>
  </DrawerOrDropdown>
</template>
