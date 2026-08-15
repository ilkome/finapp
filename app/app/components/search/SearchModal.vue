<script setup lang="ts">
import type { SearchResultItem } from '~/components/search/useSearch'

import { useSearch } from '~/components/search/useSearch'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const { t } = useI18n()
const { isSearchOpen, searchTerm } = useSearch()
const trnsFormStore = useTrnsFormStore()

const isDesktop = useIsLaptop()
const snapPoints = useSheetSnapPoints(0.42)

function onSelect(item: SearchResultItem) {
  isSearchOpen.value = false
  searchTerm.value = ''

  switch (item.entityType) {
    case 'category':
      navigateTo(`/categories/${item.entityId}`)
      break

    case 'wallet':
      navigateTo(`/wallets/${item.entityId}`)
      break

    case 'trn':
      trnsFormStore.openFormForEdit(item.entityId)
      break
  }
}

function onBottomSheetClosed() {
  isSearchOpen.value = false
  searchTerm.value = ''
}

watch(isSearchOpen, async (isOpen) => {
  if (!isOpen) {
    searchTerm.value = ''
    return
  }

  searchTerm.value = ''
  await nextTick()
  setTimeout(() => {
    if (isSearchOpen.value)
      document.querySelector<HTMLInputElement>('[data-search-command-palette] input')?.focus()
  }, 100)
})
</script>

<template>
  <!-- Desktop: UModal -->
  <UModal
    v-if="isDesktop"
    v-model:open="isSearchOpen"
    :title="t('search.title')"
    :description="t('search.placeholder')"
    :ui="{
      content: 'sm:max-w-xl sm:max-h-[80dvh]',
    }"
  >
    <template #content>
      <SearchCommandPalette
        class="h-[70dvh] min-h-100 px-2"
        @select="onSelect"
      />
    </template>
  </UModal>

  <!-- Mobile: BottomSheet -->
  <Teleport to="body">
    <BottomSheet
      v-if="!isDesktop && isSearchOpen"
      isShow
      dragClassesCustom="bottomSheetDragClassesCustom"
      :snapPoints="snapPoints"
      @closed="onBottomSheetClosed"
    >
      <template #handler>
        <BottomSheetHandler />
      </template>

      <template #default="{ isExpanded }">
        <div
          class="bottomSheetContent"
          :class="isExpanded === undefined ? 'max-h-[70dvh]' : 'h-full'"
        >
          <UiTitleModal>{{ t('search.title') }}</UiTitleModal>

          <SearchCommandPalette
            :class="isExpanded === undefined ? 'h-[70dvh] px-2' : 'h-full px-2'"
            @select="onSelect"
          />
        </div>
      </template>
    </BottomSheet>
  </Teleport>
</template>
