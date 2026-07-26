<script setup lang="ts">
const { isEnd, isShowNavHome, isStart } = defineProps<{
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
      :ariaLabel="$t('base.previous')"
      :disabled="isStart"
      class="bg-elevated/30"
      @click="emit('changeDate', 'prev')"
    >
      <Icon name="lucide:chevron-left" size="24" />
    </UiActionButton>

    <UiActionButton
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
      @click="emit('changeDate', 'today')"
    >
      <Icon name="lucide:undo-2" size="20" />
    </UiActionButton>

    <slot />
  </div>
</template>
