<script setup lang="ts">
import { useAppNav } from '~/components/app/useAppNav'

defineProps<{
  typeText: string
}>()

const appNavStore = useAppNav()
</script>

<template>
  <div>
    <StatSumGroup
      v-if="appNavStore.activeTabStat === 'summary'"
      :typeText="typeText"
    />

    <div class="px-2 flex flex-wrap items-center justify-between gap-x-6">
      <StatViewConfig />
    </div>

    <!-- StatGroupPie(:typeText="typeText") -->
    <StatGroupVertical :typeText="typeText" />
    <StatGroupRound :typeText="typeText" />
    <StatGroupHorizontal :typeText="typeText" />
  </div>
</template>
