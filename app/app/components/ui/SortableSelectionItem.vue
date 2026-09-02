<script setup lang="ts">
const props = withDefaults(defineProps<{
  ariaLabel: string
  isSelected?: boolean
  selectionMode?: 'multiple' | 'single'
}>(), {
  selectionMode: 'single',
})

const emit = defineEmits<{
  move: [direction: -1 | 1]
  select: []
}>()

const slots = useSlots()
</script>

<template>
  <UiElement insideClasses="group min-h-[46px] gap-1 px-1 py-1.5">
    <div
      class="sortableSelectionHandle -my-1.5 -ml-1 flex w-11 shrink-0 cursor-grab items-center justify-center self-stretch rounded-l-md text-muted hover:bg-accented active:cursor-grabbing"
      role="button"
      tabindex="0"
      :aria-label="props.ariaLabel"
      @click.stop
      @keydown.up.prevent="emit('move', -1)"
      @keydown.down.prevent="emit('move', 1)"
    >
      <Icon name="lucide:grip-vertical" size="20" />
    </div>

    <button
      type="button"
      class="flex min-w-0 grow items-center self-stretch rounded-md px-1 text-left"
      :role="props.selectionMode === 'multiple' ? 'checkbox' : undefined"
      :aria-checked="props.selectionMode === 'multiple' ? props.isSelected : undefined"
      :aria-pressed="props.selectionMode === 'single' ? props.isSelected : undefined"
      @click="emit('select')"
    >
      <span class="grid min-w-0 grow gap-0.5">
        <span class="flex min-w-0 items-center gap-1">
          <UiEntityName>
            <slot />
          </UiEntityName>
          <Icon
            v-if="props.isSelected"
            name="lucide:check"
            class="size-4 shrink-0 text-primary"
          />
        </span>
        <UiEntityName v-if="slots.description" variant="secondary">
          <slot name="description" />
        </UiEntityName>
      </span>
    </button>

    <slot name="actions" />
  </UiElement>
</template>
