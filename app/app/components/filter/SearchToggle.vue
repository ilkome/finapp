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

onClickOutside(root, close)
// Capture: on desktop the page scrolls inside a layout div, not the window.
useEventListener(window, 'scroll', close, { capture: true, passive: true })
</script>

<template>
  <div ref="root" class="contents">
    <button
      type="button"
      :aria-label="t('base.search')"
      :class="cn(
        'relative flex size-9 shrink-0 items-center justify-center rounded-full interactive bg-elevated text-muted',
        hasSearch && 'text-highlighted',
      )"
      @click="open"
    >
      <Icon name="lucide:search" size="18" />
      <span
        v-if="hasSearch"
        class="absolute top-1 right-1 size-1.5 rounded-full bg-primary"
      />
    </button>

    <!-- Covers the whole row so the period, filter and chips vanish while typing; the row keeps its height. -->
    <Transition
      enterActiveClass="transition-[opacity,transform] duration-200 ease-out"
      enterFromClass="scale-x-90 opacity-0"
      leaveActiveClass="transition-[opacity,transform] duration-150 ease-in"
      leaveToClass="scale-x-90 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute inset-x-2 inset-y-0 z-10 origin-left md:inset-x-0"
      >
        <input
          ref="input"
          v-model="value"
          type="text"
          :aria-label="t('base.search')"
          class="m-0 size-full theme-rounded-control border border-primary bg-elevated py-0 pr-9 pl-4 text-sm outline-none placeholder:text-muted"
          :placeholder="t('trns.filter.search')"
          @keydown.enter.prevent="close"
          @keydown.escape.stop="close"
        >
        <button
          v-if="value"
          type="button"
          :aria-label="t('base.clear')"
          class="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted hover:text-highlighted"
          @click="value = ''"
        >
          <Icon name="lucide:x" size="16" />
        </button>
      </div>
    </Transition>
  </div>
</template>
