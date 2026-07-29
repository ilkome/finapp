<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  isEqual?: boolean // every tab the same width instead of sharing the slack
  items: TabsItem[]
  modelValue?: number | string
  size?: 'md' | 'sm' | 'xs'
  variant?: 'link' | 'pill'
}>(), { size: 'md', variant: 'pill' })

const emit = defineEmits<{ 'update:modelValue': [value: number | string] }>()

const listRef = useTemplateRef<HTMLElement>('listRef')

const sizes = {
  md: 'px-3 py-1.5 text-sm gap-1.5',
  sm: 'px-2.5 py-1.5 text-xs gap-1.5',
  xs: 'px-2 py-1 text-xs gap-1',
}

// scrollIntoView would also scroll every scrollable ancestor (page, bottom sheet)
function scrollToActive() {
  const list = listRef.value
  const active = list?.querySelector<HTMLElement>('[aria-pressed="true"]')
  if (!list || !active)
    return
  list.scrollTo({ left: active.offsetLeft - (list.clientWidth - active.clientWidth) / 2 })
}

onMounted(() => nextTick(scrollToActive))
watch(() => props.modelValue, () => nextTick(scrollToActive))
</script>

<template>
  <div
    ref="listRef"
    :class="cn(
      props.variant === 'pill' && 'flex min-w-0 grow overflow-x-auto rounded-lg bg-elevated/30 p-1',
      props.variant === 'link' && 'flex min-w-0 grow overflow-x-auto border-b border-default',
      $attrs.class as string,
    )"
  >
    <button
      v-for="item in props.items"
      :key="String(item.value)"
      type="button"
      :aria-pressed="item.value === props.modelValue"
      :class="cn(
        'relative inline-flex shrink-0 grow items-center justify-center rounded-md font-medium whitespace-nowrap transition-colors',
        item.value === props.modelValue
          ? (props.variant === 'pill'
            ? 'bg-primary text-inverted shadow-xs'
            : 'text-primary after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-primary')
          : 'text-muted hover:text-default',
        sizes[props.size],
        props.isEqual && 'basis-0',
      )"
      @click="emit('update:modelValue', item.value!)"
    >
      <UIcon v-if="item.icon" :name="item.icon" />
      <span>{{ item.label }}</span>
    </button>
  </div>
</template>
