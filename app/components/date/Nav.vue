<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const props = withDefaults(defineProps<{
  isEnd: boolean
  isShowNavHome: boolean
  isStart: boolean
  position?: 'left' | 'right'
}>(), {
  position: 'left',
})

const emit = defineEmits<{
  changeDate: [action: 'prev' | 'next' | 'today']
}>()
</script>

<template>
  <div class="flex items-center gap-1">
    <UiItem3
      v-if="props.position === 'left' && props.isShowNavHome"
      @click="emit('changeDate', 'today')"
    >
      <Icon name="lucide:undo-2" size="20" />
    </UiItem3>

    <UiItem3
      :class="[getStyles('item', ['bg2']), { '!hover:transparent opacity-30': isStart }]"
      @click="emit('changeDate', 'prev')"
    >
      <Icon name="lucide:chevron-left" size="24" />
    </UiItem3>

    <UiItem3
      :class="[getStyles('item', ['bg2']), { '!hover:transparent opacity-30': isEnd }]"
      @click="emit('changeDate', 'next')"
    >
      <Icon name="lucide:chevron-left" size="24" class="rotate-180" />
    </UiItem3>

    <UiItem3
      v-if="props.position === 'right' && props.isShowNavHome"
      @click="emit('changeDate', 'today')"
    >
      <Icon name="lucide:undo-2" size="20" />
    </UiItem3>
  </div>
</template>
