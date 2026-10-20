<script setup lang="ts">
import { filterKey } from '~/components/filter/injectionKeys'

const props = withDefaults(defineProps<{
  isResetInRange?: boolean
  isShowNavigation?: boolean
  isShowSearch?: boolean
}>(), {
  isShowNavigation: true,
})

const filter = inject(filterKey)!
</script>

<template>
  <StatDateNavigation :isResetInRange="props.isResetInRange" :isShowButtons="props.isShowNavigation">
    <template v-if="props.isShowSearch" #tools>
      <FilterSearchToggle />
    </template>

    <StatFilterButton />
    <FilterSelected
      v-if="filter.isShow.value"
      class="snap-start snap-always *:snap-start *:snap-always"
      :isShowCategories="filter.canFilterCategories"
      :isShowWallets="filter.canFilterWallets"
    />
  </StatDateNavigation>
</template>
