<script setup lang="ts">
import { filterKey } from '~/components/filter/injectionKeys'

const props = withDefaults(defineProps<{
  isShowNavigation?: boolean
  isShowSearch?: boolean
}>(), {
  isShowNavigation: true,
})

const filter = inject(filterKey)!
</script>

<template>
  <StatDateNavigation :isShowButtons="isShowNavigation">
    <template v-if="props.isShowSearch" #tools>
      <FilterSearchToggle />
    </template>

    <FilterButton class="shrink-0 snap-start snap-always" />
    <FilterSelected
      v-if="filter.isShow.value"
      class="snap-start snap-always *:snap-start *:snap-always"
      :isShowCategories="filter.canFilterCategories"
      :isShowWallets="filter.canFilterWallets"
    />
  </StatDateNavigation>
</template>
