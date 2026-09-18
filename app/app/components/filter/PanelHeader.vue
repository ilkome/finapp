<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

import type CategoriesSelectorModal from '~/components/categories/SelectorModal.vue'
import type WalletsSelector from '~/components/wallets/Selector.vue'

const props = defineProps<{
  activeSlide?: 'category' | 'more' | 'wallet'
  categoriesSelector: InstanceType<typeof CategoriesSelectorModal> | null
  createItems: DropdownMenuItem[]
  isShowClose?: boolean
  showReset: boolean
  walletsSelector: InstanceType<typeof WalletsSelector> | null
}>()

const emit = defineEmits<{
  close: []
  reset: []
}>()

const search = defineModel<string>('search', { default: '' })

const { t } = useI18n()
const searchInput = useTemplateRef<HTMLInputElement>('searchInput')
const isSearchOpen = ref(false)

async function openSearch() {
  isSearchOpen.value = true
  await nextTick()
  const focus = () => searchInput.value?.focus()
  requestAnimationFrame(focus)
  setTimeout(focus, 250)
}

function toggleCategoriesView() {
  const selector = props.categoriesSelector
  if (selector)
    selector.view = selector.view === 'list' ? 'grid' : 'list'
}

function closeSearch() {
  search.value = ''
  isSearchOpen.value = false
}
</script>

<template>
  <div class="relative flex min-h-12 items-center gap-1 px-3 md:px-1">
    <div class="grow font-tertiary text-lg leading-none font-semibold">
      {{ t('base.filters') }}
    </div>

    <template v-if="props.activeSlide === 'wallet' && props.walletsSelector">
      <UDropdownMenu
        :content="{ align: 'end' }"
        :items="props.walletsSelector.groupingItems"
        :modal="false"
      >
        <UiTriggerButton icon="lucide:list-tree" :title="t('base.toggleGrouping')" />
      </UDropdownMenu>
    </template>

    <template v-if="props.activeSlide === 'category' && props.categoriesSelector">
      <UiTriggerButton
        v-if="props.categoriesSelector.filter === 'all'"
        :icon="props.categoriesSelector.view === 'list' ? 'lucide:layout-grid' : 'lucide:list'"
        :title="t('base.toggleView')"
        @click="toggleCategoriesView"
      />
      <UiTriggerButton
        v-if="props.categoriesSelector.filter === 'all'"
        :icon="props.categoriesSelector.folderIcon"
        :title="t('base.toggleFolders')"
        @click="props.categoriesSelector.toggleAll()"
      />
      <UiTriggerButton
        v-if="props.categoriesSelector.hasFavoritesOrRecent"
        icon="lucide:star"
        :isActive="props.categoriesSelector.filter === 'favorites'"
        :title="t('categories.favorite')"
        @click="props.categoriesSelector.toggleFavoritesFilter()"
      />
    </template>

    <UDropdownMenu
      :content="{ align: 'end' }"
      :items="props.createItems"
      :modal="false"
      :ui="{ content: 'min-w-52' }"
    >
      <UiTriggerButton icon="lucide:plus" :title="t('base.addWhat')" />
    </UDropdownMenu>

    <UiTriggerButton
      v-if="props.showReset"
      icon="lucide:filter-x"
      :title="t('base.reset')"
      @click="emit('reset')"
    />

    <UiTriggerButton icon="lucide:search" :title="t('base.search')" @click="openSearch" />

    <UiTriggerButton
      v-if="props.isShowClose"
      icon="lucide:x"
      :title="t('base.close')"
      @click="emit('close')"
    />

    <!-- Expanded search covers the title and the toolbar. -->
    <div
      v-if="isSearchOpen"
      class="absolute inset-x-3 inset-y-1 z-10 rounded-md bg-default md:inset-x-1"
    >
      <input
        ref="searchInput"
        v-model="search"
        type="text"
        :aria-label="t('base.search')"
        class="m-0 size-full rounded-md border border-transparent bg-elevated/30 py-2 pr-11 pl-4 text-base font-normal outline-none placeholder:text-muted hover:bg-elevated/50 focus:border-primary focus:bg-elevated/50"
        :placeholder="t('base.search')"
        @keydown.escape.stop="closeSearch"
      >
      <div class="absolute inset-y-1 right-1 aspect-square">
        <UTooltip :text="t('base.close')">
          <button
            type="button"
            :aria-label="t('base.close')"
            class="flex size-full items-center justify-center rounded-full interactive bg-elevated text-muted"
            @click="closeSearch"
          >
            <Icon name="lucide:x" size="18" />
          </button>
        </UTooltip>
      </div>
    </div>
  </div>
</template>
