<script setup lang="ts">
import { useAppNav } from '~/components/app/useAppNav'
import type { MoneyTypeSlug } from '~/components/stat/types'

defineProps<{
  moneyTypeSlug: MoneyTypeSlug
}>()

const appNavStore = useAppNav()
</script>

<template>
  <div>
    <StatSumGroup
      v-if="appNavStore.activeTabStat === 'summary'"
      :moneyTypeSlugSum="moneyTypeSlug"
    />

    <div class="px-2 flex flex-wrap items-center justify-between gap-x-6">
      <StatViewConfig />
    </div>

    <StatGroupVertical :moneyTypeSlug="moneyTypeSlug" />
    <StatGroupRound :moneyTypeSlug="moneyTypeSlug" />
    <StatGroupHorizontal :moneyTypeSlug="moneyTypeSlug" />
  </div>
</template>
