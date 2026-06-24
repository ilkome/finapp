<script setup lang="ts">
defineEmits<{
  closed: []
}>()

const { t } = useI18n()

const sections = ['intro', 'create', 'frequency', 'autoManual', 'ends', 'pending', 'manage', 'totals', 'forecast', 'budgetsLink'] as const
</script>

<template>
  <UiHelpSheet :title="t('recurrences.help.title')" @closed="$emit('closed')">
    <section v-for="key in sections" :key="key" class="grid gap-1">
      <h3 class="text-highlighted text-sm font-semibold">
        {{ t(`recurrences.help.${key}.title`) }}
      </h3>
      <p class="text-muted text-sm whitespace-pre-line">
        {{ t(`recurrences.help.${key}.body`) }}
      </p>
    </section>
  </UiHelpSheet>
</template>
