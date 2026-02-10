<script setup lang="ts">
const props = defineProps<{
  isShowTitle?: boolean
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div>
    <UiTitle3
      v-if="props.isShowTitle"
      class="pb-2"
    >
      <slot name="label" />
    </UiTitle3>

    <UiElement
      class="@container/element"
      insideClasses="max-w-lg w-full !min-h-[42px] bg-item-3 px-2 @xs/element:pl-4 @xs/element:pr-3 block @xs/element:flex @xs/element:flex-wrap gap-0 gap-x-2"
      @click="(e: Event) => emit('click', e)"
    >
      <div
        v-if="!props.isShowTitle"
        class="text-muted text-sm"
      >
        <slot name="label" />
      </div>

      <div
        :class="{
          '@xs/element:ml-auto': !props.isShowTitle,
          'grow': props.isShowTitle,
        }"
        class="flex items-center gap-1 text-base"
      >
        <slot name="value" />
        <Icon
          name="lucide:chevron-down"
          class="text-4"
          :class="{
            'ml-auto': props.isShowTitle,
          }"
        />
      </div>
    </UiElement>
  </div>
</template>
