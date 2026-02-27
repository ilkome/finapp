<script setup lang="ts">
const props = defineProps<{
  arrow?: 'left' | 'right'
  isHideArrow?: boolean
  isShown?: boolean
}>()
const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <div
    :class="cn(
      'flex grow items-center gap-2 rounded-sm min-h-[38px] min-w-[42px] pb-0 !font-tertiary !text-base font-semibold leading-none tracking-wide',
      props.arrow === 'right' ? 'justify-between px-4' : 'px-3',
      !props.isHideArrow && 'interactive',
    )"
    @click="emit('click')"
  >
    <div><slot /></div>
    <Icon
      v-if="!props.isHideArrow && !props.isShown"
      :name="props.arrow === 'right' ? 'lucide:chevron-right' : 'lucide:chevron-left'"
      size="22"
      :class="cn('-ml-1', props.arrow === 'right' && 'text-2 group-hover:text-1')"
    />
  </div>
</template>
