<script setup lang="ts">
import type { RecurrenceFreq } from '~/components/recurrences/types'

import { civilDayKey, civilDayStart, formatByLocale, toCivilDayEpoch, todayCivilDayEpoch } from '~/components/date/utils'
import { recurrenceFreqs } from '~/components/recurrences/types'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const { locale, t } = useI18n()
const trnsFormStore = useTrnsFormStore()
const repeat = computed(() => trnsFormStore.repeat)

const dateLocale = computed(() => locale.value.startsWith('ru') ? 'ru' : 'en')

// The trn's date is the series start. A future start is not created now - it appears on its date.
const isFutureStart = computed(() => civilDayStart(trnsFormStore.values.date) > todayCivilDayEpoch())
const startLabel = computed(() => formatByLocale(trnsFormStore.values.date, 'd MMM yyyy', dateLocale.value))

// Plain-language echo of the rule so the user can trust what they configured.
const summary = computed(() => {
  const r = repeat.value
  const base = r.interval === 1
    ? t(`recurrences.everyOne.${r.freq}`)
    : `${t('recurrences.form.every')} ${r.interval} ${t(`recurrences.unit.${r.freq}`, r.interval)}`
  const parts = [base]
  if (r.freq === 'month' && r.monthLastDay)
    parts.push(t('recurrences.form.monthLastDay').toLowerCase())
  if (r.endMode === 'date' && r.endDate != null)
    parts.push(`${t('recurrences.summary.until')} ${formatByLocale(r.endDate, 'd MMM yyyy', dateLocale.value)}`)
  else if (r.endMode === 'count' && r.endCount)
    parts.push(`${r.endCount}×`)
  return parts.join(' · ')
})

function setFreq(freq: RecurrenceFreq) {
  repeat.value.freq = freq
}

const endDateInput = computed({
  get: () => (repeat.value.endDate != null ? civilDayKey(repeat.value.endDate) : ''),
  set: (v: string) => {
    if (!v) {
      repeat.value.endDate = null
      return
    }
    const [y, m, d] = v.split('-').map(Number)
    repeat.value.endDate = toCivilDayEpoch(y!, m! - 1, d!)
  },
})
</script>

<template>
  <div class="bg-elevated rounded-md">
    <!-- Toggle row -->
    <button
      type="button"
      class="flex w-full items-center gap-2 px-3 py-2 text-left"
      @click="repeat.enabled = !repeat.enabled"
    >
      <Icon name="lucide:repeat" size="18" class="text-muted" />
      <div class="grow">
        <div class="text-highlighted text-sm">
          {{ t('recurrences.form.repeat') }}
        </div>
        <div v-if="repeat.enabled" class="text-2xs text-muted">
          {{ summary }}
        </div>
      </div>
      <div
        :class="repeat.enabled ? 'bg-primary' : 'bg-accented'"
        class="relative h-5 w-9 rounded-full transition"
      >
        <div
          :class="repeat.enabled ? 'translate-x-4' : ''"
          class="absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition"
        />
      </div>
    </button>

    <!-- Config -->
    <div v-if="repeat.enabled" class="grid gap-3 px-3 pt-1 pb-3">
      <!-- Future start: nothing is created now; the first payment appears on its date. -->
      <div v-if="isFutureStart" class="bg-default text-2xs text-muted flex items-center gap-1.5 rounded-sm px-2 py-1.5">
        <Icon name="lucide:clock" size="14" />
        {{ t('recurrences.form.futureStart', { date: startLabel }) }}
      </div>

      <!-- Frequency -->
      <div class="flex flex-wrap gap-1">
        <button
          v-for="f in recurrenceFreqs"
          :key="f"
          type="button"
          :class="repeat.freq === f ? 'bg-primary text-icon-primary' : 'bg-default text-muted'"
          class="rounded-sm px-3 py-1.5 text-sm"
          @click="setFreq(f)"
        >
          {{ t(`recurrences.freq.${f}`) }}
        </button>
      </div>

      <!-- Interval -->
      <label class="text-muted flex items-center gap-2 text-sm">
        {{ t('recurrences.form.every') }}
        <input
          v-model.number="repeat.interval"
          type="number"
          min="1"
          class="bg-default text-highlighted w-16 rounded-sm px-2 py-1 text-center"
        >
        {{ t(`recurrences.unit.${repeat.freq}`, repeat.interval) }}
      </label>

      <!-- Month: last day -->
      <label v-if="repeat.freq === 'month'" class="text-muted flex items-center gap-2 text-sm">
        <input v-model="repeat.monthLastDay" type="checkbox" class="size-4">
        {{ t('recurrences.form.monthLastDay') }}
      </label>

      <!-- Auto-create vs confirm -->
      <label class="text-muted flex items-center gap-2 text-sm">
        <input v-model="repeat.autoCreate" type="checkbox" class="size-4">
        {{ t('recurrences.form.autoCreate') }}
      </label>

      <!-- End condition -->
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-muted text-sm">{{ t('recurrences.form.ends') }}</span>
        <select v-model="repeat.endMode" class="bg-default text-highlighted rounded-sm px-2 py-1 text-sm">
          <option value="never">
            {{ t('recurrences.end.never') }}
          </option>
          <option value="date">
            {{ t('recurrences.end.date') }}
          </option>
          <option value="count">
            {{ t('recurrences.end.count') }}
          </option>
        </select>

        <input
          v-if="repeat.endMode === 'date'"
          v-model="endDateInput"
          type="date"
          class="bg-default text-highlighted rounded-sm px-2 py-1 text-sm"
        >
        <input
          v-if="repeat.endMode === 'count'"
          v-model.number="repeat.endCount"
          type="number"
          min="1"
          class="bg-default text-highlighted w-20 rounded-sm px-2 py-1 text-sm"
          :placeholder="t('recurrences.end.countPlaceholder')"
        >
      </div>
    </div>
  </div>
</template>
