<script setup lang="ts">
const { hideInactiveArrows = false, homeMatchesArrows = false, isEnd, isShowNavHome, isStart } = defineProps<{
  hideInactiveArrows?: boolean
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
      class="bg-elevated/30"
      @click="emit('changeDate', 'prev')"
    >
      <Icon name="lucide:chevron-left" size="24" />
    </UiActionButton>

    <UiActionButton
      v-if="!hideInactiveArrows || !isEnd"
      :ariaLabel="$t('base.next')"
      :disabled="isEnd"
      class="bg-elevated/30"
      @click="emit('changeDate', 'next')"
    >
      <Icon name="lucide:chevron-left" size="24" class="rotate-180" />
    </UiActionButton>

    <UiActionButton
      v-if="isShowNavHome"
      :ariaLabel="$t('base.today')"
      :class="homeMatchesArrows && 'bg-elevated/30'"
      @click="emit('changeDate', 'today')"
    >
      <Icon name="lucide:undo-2" size="20" />
    </UiActionButton>

    <slot />
  </div>
</template>
