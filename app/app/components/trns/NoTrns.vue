<script setup lang="ts">
defineProps<{
  label?: string
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex items-center justify-center gap-2 py-3 text-center text-muted">
    <Icon name="lucide:tree-palm" size="22" />
    <div class="text-base leading-none">
      {{ label ?? t('trns.noTrns') }}
    </div>
  </div>
</template>
