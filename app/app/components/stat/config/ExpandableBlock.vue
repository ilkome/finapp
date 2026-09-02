<script setup lang="ts">
const props = withDefaults(defineProps<{
  dataKey?: string
  hasNext?: boolean
  icon: string
  isExpanded?: boolean
  overlapTop?: boolean
  showSeparator?: boolean
  sortable?: boolean
  title: string
}>(), {
  overlapTop: true,
})

const emit = defineEmits<{
  activate: []
}>()
</script>

<template>
  <div>
    <div
      v-if="showSeparator"
      aria-hidden="true"
      class="mx-2 -my-px h-px bg-elevated/50"
    />
    <div
      class="rounded-lg border"
      :class="{
        '-mt-px': props.overlapTop,
        'mb-3': hasNext && isExpanded,
        'overflow-hidden border-default': isExpanded,
        'border-transparent': !isExpanded,
      }"
    >
      <StatConfigRow
        :data-stat-config-row="dataKey"
        hasPanel
        :icon
        :isExpanded
        :sortable
        :title
        @activate="emit('activate')"
      />
      <UCollapsible
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
