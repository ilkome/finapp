<script setup lang="ts">
defineEmits<{
  closed: []
}>()

const { t } = useI18n()

const sections = ['intro', 'period', 'amount', 'triad', 'parent', 'bar', 'projected', 'rollover', 'committed', 'safeToSpend', 'currency', 'manage'] as const
</script>

<template>
  <UiHelpSheet :title="t('budgets.help.title')" @closed="$emit('closed')">
    <section v-for="key in sections" :key="key" class="grid gap-1">
      <h3 class="text-highlighted text-sm font-semibold">
        {{ t(`budgets.help.${key}.title`) }}
      </h3>
      <p class="text-muted text-sm whitespace-pre-line">
        {{ t(`budgets.help.${key}.body`) }}
      </p>

      <!-- Illustrate the pace marker: fill (spent) ahead of the marker (expected pace). -->
      <div v-if="key === 'bar'" class="bg-default relative mt-1 h-2 rounded-full">
        <div class="bg-primary h-full rounded-full" style="width: 60%" />
        <div class="bg-inverted ring-default absolute -top-1 h-4 w-[3px] -translate-x-1/2 rounded-full ring-1" style="left: 45%" />
      </div>
    </section>
  </UiHelpSheet>
</template>
