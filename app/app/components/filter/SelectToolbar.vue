<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

import type CategoriesSelectorModal from '~/components/categories/SelectorModal.vue'
import type WalletsSelector from '~/components/wallets/Selector.vue'
import type { WalletsGroupedBy } from '~/components/wallets/types'

// Controls under the tabs of the entity sheets (transaction form picker and stat filter): the
// same set the wallets and categories pages offer, scoped to the active slide. Left to right:
// expand / collapse, view, more.
const props = defineProps<{
  activeSlide?: 'category' | 'more' | 'wallet'
  categoriesSelector: InstanceType<typeof CategoriesSelectorModal> | null
  walletsSelector: InstanceType<typeof WalletsSelector> | null
}>()

const emit = defineEmits<{
  addActive: []
  search: []
}>()

const { t } = useI18n()

const wallets = computed(() => props.activeSlide === 'wallet' ? props.walletsSelector : null)
const categories = computed(() => props.activeSlide === 'category' ? props.categoriesSelector : null)

const walletFolderIcon = computed(() => {
  const status = wallets.value?.groupsStatus
  return status?.isAllOpen ? 'lucide:folder-open' : status?.isAnyOpen ? 'lucide:folder-open-dot' : 'lucide:folder'
})

const moreItems = computed<DropdownMenuItem[][]>(() => [[{
  icon: props.activeSlide === 'wallet' ? 'lucide:plus' : undefined,
  label: t(props.activeSlide === 'wallet' ? 'base.addWallet' : 'base.addCategory'),
  onSelect: () => emit('addActive'),
}]])
</script>

<template>
  <div v-if="wallets || categories" class="flex items-center justify-end gap-1 px-3 pt-0.5">
    <UiTriggerButton class="mr-auto" icon="lucide:search" :title="t('base.search')" @click="emit('search')" />

    <template v-if="wallets">
      <UiTriggerButton
        v-if="wallets.groupedBy !== 'none'"
        :icon="walletFolderIcon"
        :title="t('base.toggleFolders')"
        @click="wallets.toggleAllGroups()"
      />
      <WalletsGroupMenu
        :groupedBy="wallets.groupedBy"
        @update:groupedBy="(v: WalletsGroupedBy) => wallets!.setGroupedBy(v)"
      >
        <UiTriggerButton icon="lucide:list-tree" :title="t('base.toggleGrouping')" />
      </WalletsGroupMenu>
    </template>

    <UiTriggerButton
      v-if="categories"
      :icon="categories.folderIcon"
      :title="t('base.toggleFolders')"
      @click="categories.toggleAll()"
    />

    <CategoriesViewSettings v-if="categories" scope="form">
      <template #trigger>
        <UiTriggerButton icon="lucide:settings-2" :title="t('stat.config.menu.label')" />
      </template>
    </CategoriesViewSettings>

    <UDropdownMenu :content="{ align: 'end' }" :items="moreItems">
      <UiTriggerButton icon="lucide:ellipsis-vertical" :title="t('base.moreOptions')" />
    </UDropdownMenu>
  </div>
</template>
