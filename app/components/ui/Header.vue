<script setup lang="ts">
import { useSearch } from '~/components/search/useSearch'

const { backTo } = defineProps<{
  backTo?: string
}>()

const { isSearchOpen } = useSearch()
</script>

<template>
  <div class="bg-default/90 sticky top-0 z-20 mb-2 backdrop-blur">
    <div class="border-item-4 grid min-h-12 max-w-7xl items-center border-b px-2 py-2 lg:px-4 lg:py-4">
      <div class="flex grow items-center">
        <NuxtLink
          v-if="backTo"
          :to="backTo"
          class="interactive text-muted flex min-h-[42px] min-w-[42px] shrink-0 cursor-default items-center justify-center rounded-sm text-xl"
        >
          <Icon name="lucide:arrow-left" size="20" />
        </NuxtLink>

        <div class="min-w-0 overflow-x-auto">
          <slot />
        </div>

        <div class="ml-auto flex shrink-0 flex-nowrap items-center gap-1 pl-2">
          <UTooltip
            :text="$t('search.title')"
            :kbds="['meta', 'K']"
            class="hidden sm:flex"
          >
            <UiActionButton
              :ariaLabel="$t('search.title')"
              @click="isSearchOpen = true"
            >
              <Icon name="lucide:search" size="20" />
            </UiActionButton>
          </UTooltip>

          <slot name="actions" />
        </div>
      </div>

      <div
        v-if="$slots.selected"
        class="-mb-2 grid lg:-mb-4"
      >
        <slot name="selected" />
      </div>
    </div>

    <div
      v-if="$slots.after"
      class="grid gap-2 pt-1 pb-2"
    >
      <slot name="after" />
    </div>
  </div>
</template>
