<script setup lang="ts">
import { filterKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  isShowCategories?: boolean
  isShowWallets?: boolean
  labelMode?: boolean
  onBeforeOpen?: () => void
}>()

const filter = inject(filterKey)!
const { t } = useI18n()
</script>

<template>
  <div class="flex items-center">
    <StatFilterSelectorItem
      v-if="props.isShowWallets"
      :hasSelection="filter?.walletsIds.value.length > 0"
      :labelMode="props.labelMode"
      :onBeforeOpen="props.onBeforeOpen"
      :title="t('wallets.filter')"
      icon="hugeicons:wallet-01"
    >
      <WalletsSelector
        :selectedIds="filter?.walletsIds.value"
        class="min-w-80 px-3"
        @selected="filter.toggleWalletId"
      />
    </StatFilterSelectorItem>

    <StatFilterSelectorItem
      v-if="props.isShowCategories"
      :buttonLabel="t('base.close')"
      :hasSelection="filter?.categoriesIds.value.length > 0"
      :labelMode="props.labelMode"
      :onBeforeOpen="props.onBeforeOpen"
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
