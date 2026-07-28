<script setup lang="ts">
import { filterKey } from '~/components/filter/injectionKeys'

const filter = inject(filterKey)!
</script>

<template>
  <StatDateNavigation>
    <FilterButton />
    <FilterSelected
      v-if="filter.isShow.value"
      isShowCategories
      isShowWallets
    />
  </StatDateNavigation>
</template>
