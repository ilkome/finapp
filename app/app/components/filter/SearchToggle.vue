<script setup lang="ts">
import { onClickOutside, useDebounceFn, useEventListener } from '@vueuse/core'

import { filterKey } from '~/components/filter/injectionKeys'

const { t } = useI18n()
const filter = inject(filterKey)!
const root = useTemplateRef<HTMLElement>('root')
const input = useTemplateRef<HTMLInputElement>('input')
const isOpen = ref(false)
const value = ref(filter.extras.value.search)
const hasSearch = computed(() => !!filter.extras.value.search)

const commit = useDebounceFn((search: string) => {
  if (search.trim() !== filter.extras.value.search)
    filter.setExtras({ search })
}, 300)

watch(value, commit)
// Chips and reset change the query from outside the input.
watch(() => filter.extras.value.search, (search) => {
  if (search !== value.value.trim())
    value.value = search
})

async function open() {
  isOpen.value = true
  await nextTick()
  input.value?.focus()
}

function close() {
  if (!isOpen.value)
    return
  isOpen.value = false
  input.value?.blur()
}

// Open: the first press clears the query, the next one (or the first, when empty) closes.
function onToggle() {
  if (!isOpen.value)
    return open()
  if (value.value) {
    value.value = ''
    input.value?.focus()
    return
  }
  close()
}

onClickOutside(root, close)
// Close on the user scrolling, not on any scroll event: the feed reloads on every query change
// and restores its scroll position, and focusing the input can scroll the strip.
function closeOnUserScroll(event: Event) {
  if (!root.value?.contains(event.target as Node))
    close()
}
useEventListener(window, ['wheel', 'touchmove'], closeOnUserScroll, { capture: true, passive: true })
</script>

<template>
  <!-- Grows in place from the round button; the rest of the row slides right instead of being covered. -->
  <div
    ref="root"
    :class="cn(
      'relative flex h-9 shrink-0 items-center rounded-full bg-elevated transition-[width] duration-200 ease-out [interpolate-size:allow-keywords]',
      isOpen ? 'w-auto ring-1 ring-primary ring-inset' : 'w-9',
    )"
  >
    <button
      type="button"
      :aria-label="!isOpen ? t('base.search') : value ? t('base.clear') : t('base.close')"
      :class="cn(
        'relative flex size-9 shrink-0 items-center justify-center rounded-full interactive text-muted',
        hasSearch && 'text-highlighted',
        isOpen && 'hover:bg-primary! hover:text-inverted',
      )"
      @click="onToggle"
    >
      <Icon :name="isOpen ? 'lucide:x' : 'lucide:search'" size="18" />
      <span
        v-if="hasSearch && !isOpen"
        class="absolute top-1 right-1 size-1.5 rounded-full bg-primary"
      />
    </button>

    <input
      v-if="isOpen"
      ref="input"
      v-model="value"
      type="text"
      :aria-label="t('base.search')"
      :size="Math.max(t('trns.filter.search').length, value.length) + 1"
      class="m-0 h-full min-w-0 grow bg-transparent py-0 pr-4 pl-1 text-sm outline-none placeholder:text-muted"
      :placeholder="t('trns.filter.search')"
      @keydown.enter.prevent="close"
      @keydown.escape.stop="close"
    >
  </div>
</template>
