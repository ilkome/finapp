<script setup lang="ts">
import { filterKey } from '~/components/filter/injectionKeys'

withDefaults(defineProps<{
  isShowNavigation?: boolean
}>(), {
  isShowNavigation: true,
})

const filter = inject(filterKey)!
</script>

<template>
  <StatDateNavigation :isShowButtons="isShowNavigation">
    <FilterButton class="shrink-0 snap-start snap-always" />
    <FilterSelected
      v-if="filter.isShow.value"
      class="snap-start snap-always *:snap-start *:snap-always"
      isShowCategories
      isShowWallets
    />
  </StatDateNavigation>
</template>
