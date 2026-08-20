<script setup lang="ts">
const props = defineProps<{
  insideClasses?: string
  isActive?: boolean
  lineWidth?: number
  rounded?: boolean
  to?: string
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()

const NuxtLink = resolveComponent('NuxtLink')
const slots = useSlots()

const elementClasses = computed(() => cn(
  'uiElement -my-0.25 flex min-h-10.5 grow items-center gap-3 overflow-hidden border border-transparent interactive px-2 py-1.5',
  props.rounded ? 'rounded-full pr-3' : 'rounded-md',
  props.insideClasses,
  { 'relative z-10 bg-elevated/30 border-primary/30': props.isActive },
))
</script>

<template>
  <component
    :is="props.to ? NuxtLink : 'div'"
    :to="props.to"
    :class="{ uiElementLink: props.to }"
    @click="(e: Event) => emit('click', e)"
  >
    <div :class="elementClasses">
      <div
        v-if="slots.leftIcon"
        class="flex-center min-w-8"
      >
        <slot name="leftIcon" />
      </div>

      <slot name="default" />
      <slot name="line" />
    </div>

    <!-- Separator. `group-last:hidden` means "last row of the block", so the CALLER must put
         `group` on the row element, not on a wrapper. An expanded parent hides its own separator
         with [&_.uiElementLine]:bg-transparent instead of dropping lineWidth. -->
    <div
      v-if="lineWidth"
      :class="{
        'ml-12': lineWidth === 1 || lineWidth === 2,
        'group-last/trn:hidden': lineWidth === 3,
        'ml-12 group-last/item:hidden': lineWidth === 4,
        'group-last:hidden': lineWidth !== 3 && lineWidth !== 4,
      }"
      class="uiElementLine mx-2 h-px bg-elevated/50"
    />
  </component>
</template>

<style>
@reference '../../assets/css/main.css';

a.uiElementLink {
  @apply no-underline text-inherit;
}

[data-state='open'] > .uiElement {
  @apply bg-accented!;
}
</style>
