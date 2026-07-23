<script setup lang="ts">
import type { TrnId } from '~/components/trns/types'

import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'

const { t } = useI18n()
const recurrencesStore = useRecurrencesStore()

const pending = computed(() => recurrencesStore.pendingAdoption)
const selected = ref<Set<TrnId>>(new Set())

// Seed the checkboxes from the store's pre-selection each time a new adoption opens.
watch(pending, (p) => {
  selected.value = new Set(p?.preselectedIds ?? [])
}, { immediate: true })

const selectedIds = computed(() => [...selected.value])

function toggle(id: TrnId) {
  const next = new Set(selected.value)
  if (next.has(id))
    next.delete(id)
  else
    next.add(id)
  selected.value = next
}

function confirm(close: () => void) {
  const p = pending.value
  if (p)
    recurrencesStore.adoptOccurrences(p.ruleId, [...selected.value])
  close()
}

function onClosed() {
  recurrencesStore.pendingAdoption = null
}
</script>

<template>
  <BottomSheetModal v-if="pending" @closed="onClosed">
    <template #default="{ close }">
      <UiTitleModal>
        {{ t('recurrences.adopt.title') }}
      </UiTitleModal>

      <div class="bottomSheetContentInside scrollerBlock grid content-start gap-3 px-3 py-2">
        <div class="text-2xs text-muted">
          {{ t('recurrences.adopt.subtitle', { count: pending.candidateIds.length }) }}
        </div>

        <TrnsList
          :selectable="true"
          :selectedTrnIds="selectedIds"
          :trnsIds="pending.candidateIds"
          isShowDates
          @toggleSelect="toggle"
        />
      </div>

      <div class="bottomSheetContentBottom flex gap-2">
        <UiButtonAccent variant="ghost" rounded @click="close">
          {{ t('recurrences.adopt.cancel') }}
        </UiButtonAccent>
        <UiButtonAccent rounded @click="confirm(close)">
          {{ t('recurrences.adopt.confirm', { count: selected.size }) }}
        </UiButtonAccent>
      </div>
    </template>
  </BottomSheetModal>
</template>
