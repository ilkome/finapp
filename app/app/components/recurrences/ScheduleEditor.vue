<script setup lang="ts">
import type { RecurrenceEndMode, RecurrenceSchedule } from '~/components/recurrences/types'

import { civilDayKey, toCivilDayEpoch } from '~/components/date/utils'
import { recurrenceFreqs } from '~/components/recurrences/types'

// Both parents (trnForm Repeat "create" and recurrences Form "edit") pass the SAME reactive
// object; we mutate its properties in place and never reassign `model.value`, so changes
// propagate back without an emit (a reassign would break the create path's Pinia store state).
const model = defineModel<RecurrenceSchedule>({ required: true })

const { t } = useI18n()

const endModeOptions = computed(() => [
  { label: t('recurrences.end.never'), value: 'never' },
  { label: t('recurrences.end.date'), value: 'date' },
  { label: t('recurrences.end.count'), value: 'count' },
])

const endDateInput = computed({
  get: () => (model.value.endDate != null ? civilDayKey(model.value.endDate) : ''),
  set: (v: string) => {
    if (!v) {
      model.value.endDate = null
      return
    }
    const [y, m, d] = v.split('-').map(Number)
    model.value.endDate = toCivilDayEpoch(y!, m! - 1, d!)
  },
})
</script>

<template>
  <div class="grid content-start gap-5">
    <!-- Frequency -->
    <FormElement>
      <template #label>
        {{ t('recurrences.form.repeat') }}
      </template>
      <UiTabsBar>
        <UiTabsItemPill
          v-for="f in recurrenceFreqs"
          :key="f"
          :isActive="model.freq === f"
          @click="model.freq = f"
        >
          {{ t(`recurrences.freq.${f}`) }}
        </UiTabsItemPill>
      </UiTabsBar>
    </FormElement>

    <!-- Interval -->
    <FormElement>
      <template #label>
        {{ t('recurrences.form.every') }}
      </template>
      <div class="flex items-center gap-2">
        <UiNumberStepper
          :modelValue="model.interval"
          :min="1"
          @update:modelValue="model.interval = $event"
        />
        <span class="text-muted text-sm">{{ t(`recurrences.unit.${model.freq}`, model.interval) }}</span>
      </div>
    </FormElement>

    <!-- Options -->
    <div class="grid gap-1">
      <UiSwitchItem
        v-if="model.freq === 'month'"
        :checkboxValue="model.monthLastDay"
        :title="t('recurrences.form.monthLastDay')"
        @click="model.monthLastDay = !model.monthLastDay"
      />
      <UiSwitchItem
        :checkboxValue="model.autoCreate"
        :title="t('recurrences.form.autoCreate')"
        @click="model.autoCreate = !model.autoCreate"
      />
    </div>

    <!-- End condition -->
    <FormElement>
      <template #label>
        {{ t('recurrences.form.ends') }}
      </template>
      <FormSelect
        :options="endModeOptions"
        :value="model.endMode"
        @change="(v: string) => model.endMode = v as RecurrenceEndMode"
      />
      <input
        v-if="model.endMode === 'date'"
        v-model="endDateInput"
        type="date"
        class="bg-elevated/40 text-highlighted mt-2 rounded-sm px-3 py-2 text-sm"
      >
      <div v-if="model.endMode === 'count'" class="mt-2 flex items-center gap-2">
        <UiNumberStepper
          :modelValue="model.endCount ?? 1"
          :min="1"
          @update:modelValue="model.endCount = $event"
        />
        <span class="text-muted text-sm">{{ t('recurrences.end.countPlaceholder') }}</span>
      </div>
    </FormElement>
  </div>
</template>
