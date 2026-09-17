<script setup lang="ts">
const props = withDefaults(defineProps<{
  isEnd: boolean
  /** Arrows are hidden entirely for custom ranges and when there is nothing to step through. */
  isShowArrows?: boolean
  isShowHome: boolean
  isStart: boolean
}>(), { isShowArrows: true })

const emit = defineEmits<{
  changeDate: [way: 'next' | 'prev' | 'today']
}>()
</script>

<template>
  <div
    class="relative -mx-2 scroll-strip flex min-h-9.5 grow snap-x snap-mandatory scroll-px-2 items-center gap-2 overflow-x-auto px-2 md:mx-0 md:scroll-px-0 md:px-0"
  >
    <UiNavArrows
      v-if="props.isShowArrows"
      class="shrink-0 snap-start"
      compact
      hideInactiveArrows
      :homeAriaLabel="$t('base.reset')"
      homeMatchesArrows
      :isEnd="props.isEnd"
      :isShowNavHome="props.isShowHome"
      :isStart="props.isStart"
      @changeDate="emit('changeDate', $event)"
    >
      <template #tools>
        <slot name="tools" />
      </template>
      <!-- No snap-start here: a nested snap target lets the browser snap past the arrows,
           which parks the strip mid-scroll and hides its left edge. -->
      <slot name="range" />
    </UiNavArrows>

    <template v-else>
      <slot name="tools" />
      <div class="shrink-0 snap-start">
        <slot name="range" />
      </div>
    </template>

    <slot />
  </div>
</template>
