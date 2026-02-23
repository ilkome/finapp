<script setup lang="ts">
const { isEnd, isShowNavHome, isStart, position = 'left' } = defineProps<{
  isEnd: boolean
  isShowNavHome: boolean
  isStart: boolean
  position?: 'left' | 'right'
}>()

const emit = defineEmits<{
  changeDate: [action: 'prev' | 'next' | 'today']
}>()
</script>

<template>
  <div class="flex items-center gap-1">
    <UiActionButton
      v-if="position === 'left' && isShowNavHome"
      @click="emit('changeDate', 'today')"
    >
      <Icon name="lucide:undo-2" size="20" />
    </UiActionButton>

    <UiActionButton
      :class="cn('bg-item-3', isStart && 'hover:transparent opacity-30')"
      @click="emit('changeDate', 'prev')"
    >
      <Icon name="lucide:chevron-left" size="24" />
    </UiActionButton>

    <UiActionButton
      :class="cn('bg-item-3', isEnd && 'hover:transparent opacity-30')"
      @click="emit('changeDate', 'next')"
    >
      <Icon name="lucide:chevron-left" size="24" class="rotate-180" />
    </UiActionButton>

    <UiActionButton
      v-if="position === 'right' && isShowNavHome"
      @click="emit('changeDate', 'today')"
    >
      <Icon name="lucide:undo-2" size="20" />
    </UiActionButton>
  </div>
</template>
