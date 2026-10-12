<script setup lang="ts">
const props = withDefaults(defineProps<{
  amount: number
  currencyCode: string
  isShowBaseRate?: boolean
  title: string
}>(), { isShowBaseRate: true })
</script>

<template>
  <div class="rounded-sm bg-elevated/30 px-3 py-2">
    <UiText variant="caption">
      {{ props.title }}
    </UiText>
    <Amount
      :amount="props.amount"
      :currencyCode="props.currencyCode"
      :isShowBaseRate="props.isShowBaseRate"
      align="left"
      variant="summary"
    />
  </div>
</template>
