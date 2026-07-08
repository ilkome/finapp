<script setup lang="ts">
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const { t } = useI18n()
const trnsFormStore = useTrnsFormStore()
const trnsStore = useTrnsStore()
const recurrencesStore = useRecurrencesStore()

// The linked rule, when the edited trn is an occurrence of an existing series.
const rule = computed(() => {
  const trnId = trnsFormStore.values.trnId
  const recurrenceId = trnId ? trnsStore.items?.[trnId]?.recurrenceId : undefined
  return recurrenceId ? { id: recurrenceId, item: recurrencesStore.items?.[recurrenceId] } : undefined
})

const periodLabel = computed(() => {
  const r = rule.value?.item
  if (!r)
    return ''
  return r.interval === 1
    ? t(`recurrences.everyOne.${r.freq}`)
    : `${t('recurrences.form.every')} ${r.interval} ${t(`recurrences.unit.${r.freq}`, r.interval)}`
})

async function openSeries() {
  const id = rule.value?.id
  if (!id)
    return
  // Navigate first, THEN close the form. On mobile the form is a bottom sheet with a synthetic
  // history entry (useSheetHistory); closing it first fires history.go(-1), which would race the
  // route change and drop the ?edit query. Letting the router guard unwind the sheet keeps it.
  await navigateTo({ path: '/recurrences', query: { edit: id } })
  trnsFormStore.onClose()
}
</script>

<template>
  <button
    v-if="rule?.item"
    type="button"
    class="bg-elevated flex w-full items-center gap-2 rounded-md px-3 py-2 text-left"
    @click="openSeries"
  >
    <Icon name="lucide:repeat" size="18" class="text-muted" />
    <div class="grow">
      <div class="text-highlighted text-sm">
        {{ t('recurrences.form.repeat') }} · {{ periodLabel }}
      </div>
      <div class="text-2xs text-muted">
        {{ t('recurrences.partOfSeries') }}
      </div>
    </div>
    <span class="text-2xs text-muted">{{ t('recurrences.editTitle') }}</span>
    <Icon name="lucide:chevron-right" size="18" class="text-muted" />
  </button>
</template>
