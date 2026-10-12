<script setup lang="ts">
const props = defineProps<{
  isClosed?: boolean
  overdueCount: number
}>()

const { t } = useI18n()
</script>

<template>
  <UBadge v-if="props.isClosed" color="neutral" variant="soft" size="sm">
    {{ t('loans.closed') }}
  </UBadge>

  <UBadge v-if="props.overdueCount > 0" color="error" variant="soft" size="sm">
    {{ t('loans.overdue') }}: {{ props.overdueCount }}
  </UBadge>
</template>
