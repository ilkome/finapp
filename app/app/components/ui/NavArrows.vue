<script setup lang="ts">
const { compact = false, hideInactiveArrows = false, homeAriaLabel, homeMatchesArrows = false, isEnd, isShowNavHome, isStart } = defineProps<{
  compact?: boolean
  hideInactiveArrows?: boolean
  homeAriaLabel?: string
  homeMatchesArrows?: boolean
  isEnd: boolean
  isShowNavHome: boolean
  isStart: boolean
}>()

const emit = defineEmits<{
  changeDate: [action: 'prev' | 'next' | 'today']
}>()
</script>

<template>
  <div class="flex items-center gap-1">
    <UiActionButton
      v-if="!hideInactiveArrows || !isStart"
      :ariaLabel="$t('base.previous')"
      :disabled="isStart"
      class="bg-elevated"
      :class="compact && 'min-h-9! min-w-9!'"
      @click="emit('changeDate', 'prev')"
    >
      <Icon name="lucide:chevron-left" size="24" />
    </UiActionButton>

    <UiActionButton
      v-if="!hideInactiveArrows || !isEnd"
      :ariaLabel="$t('base.next')"
      :disabled="isEnd"
      class="bg-elevated"
      :class="compact && 'min-h-9! min-w-9!'"
      @click="emit('changeDate', 'next')"
    >
      <Icon name="lucide:chevron-left" size="24" class="rotate-180" />
    </UiActionButton>

    <UiActionButton
      v-if="isShowNavHome"
      :ariaLabel="homeAriaLabel ?? $t('base.today')"
      :class="[homeMatchesArrows && 'bg-elevated', compact && 'min-h-9! min-w-9!']"
      @click="emit('changeDate', 'today')"
    >
      <Icon name="lucide:undo-2" size="20" />
    </UiActionButton>

    <slot />
  </div>
</template>
