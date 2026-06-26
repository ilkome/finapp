<script setup lang="ts">
import type { RecurrenceId, RecurrenceStatus } from '~/components/recurrences/types'

import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'

const emit = defineEmits<{
  edit: [id: RecurrenceId]
}>()

const { t } = useI18n()
const recurrencesStore = useRecurrencesStore()

const order: RecurrenceStatus[] = ['active', 'paused', 'cancelled']

const groups = computed(() => {
  const buckets: Record<RecurrenceStatus, { id: string, rule: typeof items[string] }[]> = {
    active: [],
    cancelled: [],
    paused: [],
  }
  const items = recurrencesStore.items ?? {}
  for (const [id, rule] of Object.entries(items))
    buckets[rule.status].push({ id, rule })
  return buckets
})
</script>

<template>
  <div class="grid gap-4">
    <div v-for="status in order" :key="status">
      <template v-if="groups[status].length">
        <UiTextSubtitle class="mb-1 px-1 tracking-wide uppercase">
          {{ t(`recurrences.status.${status}`) }} ({{ groups[status].length }})
        </UiTextSubtitle>
        <div class="grid gap-1">
          <RecurrencesItem
            v-for="entry in groups[status]"
            :id="entry.id"
            :key="entry.id"
            :rule="entry.rule"
            @edit="emit('edit', $event)"
          />
        </div>
      </template>
    </div>
  </div>
</template>
