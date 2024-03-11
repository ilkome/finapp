<script setup lang="ts">
const isShowDateSelector = inject("isShowDateSelector") as boolean
</script>

<template>
  <div class="flex items-center justify-between gap-2 px-2">
    <StatDateNav />
    <StatDateView />
    <CurrenciesChangeBtn />
  </div>

  <LazyStatDateModal v-if="isShowDateSelector" />
</template>
