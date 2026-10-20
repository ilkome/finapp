<script setup lang="ts">
const props = defineProps<{
  caption?: string
  isCollapsed?: boolean
  title: string
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <div class="border-t border-default pt-6 @3xl/page:col-span-2" data-analytics-group>
    <button
      type="button"
      class="grid w-full gap-1 rounded-md interactive px-2 text-left"
      :aria-expanded="!props.isCollapsed"
      @click="emit('toggle')"
    >
      <h2 class="flex items-center gap-2 text-lg font-semibold text-highlighted">
        {{ props.title }}
        <Icon :name="props.isCollapsed ? 'lucide:chevron-down' : 'lucide:chevron-up'" size="18" class="text-muted" />
      </h2>
      <UiText v-if="props.caption" variant="meta">
        {{ props.caption }}
      </UiText>
    </button>
  </div>
</template>
