<script setup lang="ts">
const props = defineProps<{
  isHideArrow?: boolean
  isShown?: boolean
}>()
const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <component
    :is="props.isHideArrow ? 'div' : 'button'"
    :type="props.isHideArrow ? undefined : 'button'"
    :aria-expanded="props.isHideArrow ? undefined : props.isShown"
    :class="cn(
      'flex min-h-10.5 min-w-10.5 grow items-center gap-2 rounded-full px-3 pb-0 text-left font-tertiary! text-base! leading-none font-semibold tracking-wide',
      !props.isHideArrow && 'interactive',
    )"
    @click="emit('click')"
  >
    <div><slot /></div>
    <Icon
      v-if="!props.isHideArrow && !props.isShown"
      name="lucide:chevron-right"
      size="22"
      :class="cn('-ml-1')"
    />
  </component>
</template>
