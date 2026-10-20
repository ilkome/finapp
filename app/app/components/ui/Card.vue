<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  /** `button` makes the whole card one control; ignored with `to`. */
  as?: 'button' | 'div'
  chevron?: 'more' | 'right'
  title?: string
  to?: string
}>()

const NuxtLink = resolveComponent('NuxtLink')
const attrs = useAttrs()
const isInteractive = computed(() => !!props.to || props.as === 'button')
</script>

<template>
  <component
    :is="props.to ? NuxtLink : (props.as ?? 'div')"
    :to="props.to"
    :type="!props.to && props.as === 'button' ? 'button' : undefined"
    v-bind="{ ...attrs, class: undefined }"
    :class="cn('grid content-start gap-1 rounded-md bg-elevated/30 px-3 py-2.5 text-left', isInteractive && 'interactive', props.to && 'text-inherit no-underline', attrs.class as string)"
  >
    <div v-if="props.title || props.chevron" class="flex items-center gap-2">
      <UiText variant="caption" class="grow">
        {{ props.title }}
      </UiText>
      <Icon
        v-if="props.chevron"
        :name="props.chevron === 'more' ? 'lucide:ellipsis' : 'lucide:chevron-right'"
        size="16"
        class="shrink-0 text-dimmed"
        aria-hidden="true"
      />
    </div>
    <slot />
  </component>
</template>
