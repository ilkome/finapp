<script setup lang="ts">
defineProps<{
  hasPanel?: boolean
  hasToggle?: boolean
  isShow?: boolean
  subtitle?: string
  title: string
}>()

defineEmits<{
  activate: []
  toggle: []
}>()
</script>

<template>
  <div class="hover:bg-elevated/50 flex min-h-[52px] items-stretch rounded-sm text-sm">
    <div
      role="button"
      tabindex="0"
      class="flex grow flex-col justify-center rounded-l-sm py-3 pr-2 pl-3"
      :class="!hasToggle && 'rounded-r-sm pr-3'"
      @click="$emit('activate')"
      @keydown.enter.prevent="$emit('activate')"
      @keydown.space.prevent="$emit('activate')"
    >
      <div class="flex items-center gap-2">
        <span>{{ title }}</span>
        <Icon
          v-if="hasPanel"
          name="lucide:chevron-right"
          class="text-muted shrink-0"
          size="18"
        />
      </div>
      <span
        v-if="subtitle"
        class="text-dimmed text-xs"
      >
        {{ subtitle }}
      </span>
    </div>
    <div
      v-if="hasToggle && hasPanel"
      aria-hidden="true"
      class="bg-accented my-4 w-px shrink-0"
    />
    <div
      v-if="hasToggle"
      role="switch"
      tabindex="0"
      :aria-checked="isShow"
      class="flex shrink-0 items-center rounded-r-sm pr-3 pl-4"
      :class="hasPanel && 'hover:bg-accented'"
      @click.stop="$emit('toggle')"
      @keydown.enter.stop.prevent="$emit('toggle')"
      @keydown.space.stop.prevent="$emit('toggle')"
    >
      <FormSwitch :value="!!isShow" />
    </div>
  </div>
</template>
