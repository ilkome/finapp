<script setup lang="ts">
const props = defineProps<{
  amount?: number
  currencyCode?: string
  hint?: string
  title: string
  tone: 'error' | 'warning'
}>()
</script>

<template>
  <div
    class="grid gap-1 rounded-sm px-3 py-2"
    :class="props.tone === 'error' ? 'bg-error/10' : 'bg-warning/10'"
  >
    <div class="flex items-baseline justify-between gap-2">
      <UiText variant="navigation">
        {{ props.title }}
      </UiText>
      <Amount
        v-if="props.amount !== undefined && props.currencyCode"
        :amount="props.amount"
        :currencyCode="props.currencyCode"
        align="left"
        variant="secondary"
      />
    </div>
    <UiText v-if="props.hint" variant="meta">
      {{ props.hint }}
    </UiText>
  </div>
</template>
