<script setup lang="ts">
defineProps<{
  compact?: boolean
  dataKey?: string
  hasNext?: boolean
  icon: string
  isExpanded?: boolean
  showSeparator?: boolean
  sortable?: boolean
  title: string
}>()

const emit = defineEmits<{
  activate: []
}>()
</script>

<template>
  <div class="min-w-0">
    <div
      v-if="showSeparator"
      aria-hidden="true"
      class="mx-2 -my-px h-px bg-elevated/50"
    />
    <div :class="hasNext && isExpanded && 'mb-3'">
      <StatConfigRow
        :compact="compact"
        :data-stat-config-row="dataKey"
        hasPanel
        :icon
        :isExpanded
        :sortable
        :title
        @activate="emit('activate')"
      />
      <UCollapsible
        v-if="$slots.default"
        :open="isExpanded"
        :ui="{ content: 'overflow-hidden' }"
      >
        <template #content>
          <slot />
        </template>
      </UCollapsible>
    </div>
  </div>
</template>
