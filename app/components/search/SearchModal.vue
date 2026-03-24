<script setup lang="ts">
import type { SearchResultItem } from '~/components/search/useSearch'

import { useSearch } from '~/components/search/useSearch'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const { t } = useI18n()
const { isSearchOpen, onMenuClick, searchTerm } = useSearch()
const trnsFormStore = useTrnsFormStore()

const { width } = useWindowSize()
const { pointerType } = usePointer()
const isDesktop = computed(() => width.value >= 766 && pointerType.value === 'mouse')

function onSelect(item: SearchResultItem) {
  isSearchOpen.value = false
  searchTerm.value = ''

  switch (item.entityType) {
    case 'menu':
      onMenuClick(item.entityId)
      break

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
        class="h-[70dvh] min-h-[400px] px-2"
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
      @closed="onBottomSheetClosed"
    >
      <template #handler="{ close }">
        <BottomSheetHandler />
        <BottomSheetClose @click="close" />
      </template>

      <template #default>
        <div class="bottomSheetContent">
          <UiTitleModal>{{ t('search.title') }}</UiTitleModal>

          <SearchCommandPalette
            class="h-[70dvh] px-2"
            @select="onSelect"
          />
        </div>
      </template>
    </BottomSheet>
  </Teleport>
</template>
