<script setup lang="ts">
defineProps<{
  compact?: boolean
  hasPanel?: boolean
  hasToggle?: boolean
  icon?: string
  isExpanded?: boolean
  isShow?: boolean
  sortable?: boolean
  title: string
}>()

defineEmits<{
  activate: []
  toggle: []
}>()
</script>

<template>
  <div
    class="flex items-stretch text-sm hover:bg-elevated/50"
    :class="[
      compact ? 'min-h-[46px]' : 'min-h-13',
      isExpanded ? 'rounded-t-lg' : 'rounded-sm',
    ]"
  >
    <div
      v-if="sortable"
      class="sortHandle flex w-12 shrink-0 cursor-grab items-center justify-center text-muted hover:bg-accented active:cursor-grabbing"
      :class="isExpanded ? 'rounded-tl-lg' : 'rounded-l-sm'"
      :aria-label="$t('stat.views.drag')"
      @click.stop
    >
      <Icon name="lucide:grip-vertical" size="20" />
    </div>
    <div
      role="button"
      tabindex="0"
      :aria-expanded="hasPanel ? isExpanded : undefined"
      class="flex grow flex-col justify-center py-3 pr-2"
      :class="[
        sortable ? 'pl-2' : 'pl-3',
        !sortable && (isExpanded ? 'rounded-tl-lg' : 'rounded-l-sm'),
        !hasToggle && (isExpanded ? 'rounded-tr-lg pr-3' : 'rounded-r-sm pr-3'),
      ]"
      @click="$emit('activate')"
      @keydown.enter.prevent="$emit('activate')"
      @keydown.space.prevent="$emit('activate')"
    >
      <div class="flex items-center gap-2">
        <Icon
          v-if="icon"
          :name="icon"
          class="shrink-0 text-muted"
          size="20"
        />
        <span>{{ title }}</span>
        <Icon
          v-if="hasPanel"
          name="lucide:chevron-right"
          class="shrink-0 text-muted transition-transform"
          :class="isExpanded && 'rotate-90'"
          size="18"
        />
      </div>
    </div>
    <div
      v-if="hasToggle && hasPanel"
      aria-hidden="true"
      class="my-4 w-px shrink-0 bg-accented"
    />
    <div
      v-if="hasToggle"
      role="switch"
      tabindex="0"
      :aria-checked="isShow"
      :aria-label="title"
      class="flex shrink-0 items-center pr-3 pl-4"
      :class="[
        isExpanded ? 'rounded-tr-lg' : 'rounded-r-sm',
        hasPanel && 'hover:bg-accented',
      ]"
      @click.stop="$emit('toggle')"
      @keydown.enter.stop.prevent="$emit('toggle')"
      @keydown.space.stop.prevent="$emit('toggle')"
    >
      <FormSwitch :value="!!isShow" />
    </div>
  </div>
</template>
