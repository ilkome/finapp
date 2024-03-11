<script setup lang="ts">
import { useAppNav } from "~/components/app/useAppNav"

const appNavStore = useAppNav()
</script>

<template>
  <div
    v-if="appNavStore.activeTabStat === 'summary'"
    class="mx-2 mb-6 flex flex-wrap items-center gap-4 rounded-lg bg-item-4 p-2 sm_justify-start sm_bg-transparent sm_p-0"
  >
    <StatSumGroup typeText="expense" />
    <StatSumGroup typeText="income" />
    <StatSumTotal />
  </div>
</template>
