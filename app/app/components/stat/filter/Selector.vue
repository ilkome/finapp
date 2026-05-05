<script setup lang="ts">
import { filterKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  isShowCategories?: boolean
  isShowWallets?: boolean
  labelMode?: boolean
}>()

const filter = inject(filterKey)!
const { t } = useI18n()

const { width } = useWindowSize()
const { pointerType } = usePointer()
const isLaptop = computed(() => width.value >= 766 && pointerType.value === 'mouse')
</script>

<template>
  <div :class="props.labelMode ? 'grid' : 'flex items-center'">
    <StatFilterSelectorItem
      v-if="props.isShowWallets"
      :hasSelection="filter?.walletsIds.value.length > 0"
      :labelMode="props.labelMode"
      :title="t('wallets.filter')"
      icon="hugeicons:wallet-01"
    >
      <WalletsSelector
        :filterAtTop="isLaptop"
        :selectedIds="filter?.walletsIds.value"
        class="min-w-80 px-3"
        @selected="filter.toggleWalletId"
      />
    </StatFilterSelectorItem>

    <StatFilterSelectorItem
      v-if="props.isShowCategories"
      :hasSelection="filter?.categoriesIds.value.length > 0"
      :labelMode="props.labelMode"
      :title="t('categories.filter')"
      icon="hugeicons:folder-library"
    >
      <div class="scrollerBlock overflow-y-auto">
        <CategoriesSelectorTree
          :selectedIds="filter?.categoriesIds.value"
          class="min-w-80 px-3"
          @selected="filter.toggleCategoryId"
          @setCategories="filter.setCategories"
        />
      </div>
    </StatFilterSelectorItem>
  </div>
</template>
