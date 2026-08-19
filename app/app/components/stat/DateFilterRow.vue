<script setup lang="ts">
import { filterKey } from '~/components/filter/injectionKeys'

const filter = inject(filterKey)!
</script>

<template>
  <StatDateNavigation>
    <FilterButton class="shrink-0 snap-start snap-always" />
    <FilterSelected
      v-if="filter.isShow.value"
      class="snap-start snap-always *:snap-start *:snap-always"
      isShowCategories
      isShowWallets
    />
    <StatViewToolbar class="shrink-0 snap-start snap-always" />
  </StatDateNavigation>
</template>
