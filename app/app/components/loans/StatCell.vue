<script setup lang="ts">
const props = withDefaults(defineProps<{
  amount: number
  currencyCode: string
  isShowBaseRate?: boolean
  title: string
}>(), { isShowBaseRate: true })
</script>

<template>
  <UiCard :title="props.title">
    <Amount
      :amount="props.amount"
      :currencyCode="props.currencyCode"
      :isShowBaseRate="props.isShowBaseRate"
      align="left"
      variant="summary"
    />
  </UiCard>
</template>
