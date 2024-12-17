<script setup lang="ts">
const props = defineProps<{
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
    <UiItem3
      v-if="props.isShowNavHome"
      @click="emit('changeDate', 'today')"
    >
      <Icon name="lucide:undo-2" size="20" />
    </UiItem3>

    <UiItem3
      :class="{ '!hocus:transparent opacity-30': isStart }"
      class="bg-item-4"
      @click="emit('changeDate', 'prev')"
    >
      <Icon name="lucide:chevron-left" size="24" />
    </UiItem3>

    <UiItem3
      :class="{ '!hocus:transparent opacity-30': isEnd }"
      class="bg-item-4 "
      @click="emit('changeDate', 'next')"
    >
      <Icon name="lucide:chevron-left" size="24" class="rotate-180" />
    </UiItem3>
  </div>
</template>
