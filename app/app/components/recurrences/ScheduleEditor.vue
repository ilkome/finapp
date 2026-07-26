<script setup lang="ts">
import type { RecurrenceEndMode, RecurrenceSchedule } from '~/components/recurrences/types'

import { todayCivilDayEpoch } from '~~/utils/date/civil'
import { seedEndField } from '~/components/recurrences/occurrences'
import { recurrenceFreqs } from '~/components/recurrences/types'

// Both parents (trnForm Repeat "create" and recurrences Form "edit") pass the SAME reactive
// object; we mutate its properties in place and never reassign `model.value`, so changes
// propagate back without an emit (a reassign would break the create path's Pinia store state).
const model = defineModel<RecurrenceSchedule>({ required: true })

const { t } = useI18n()

// Commit the default the active end control already shows the moment the mode is chosen (and repair
// a legacy rule opened in count/date mode with a null field via immediate), so we never persist a
// 'count' rule that generates nothing or a 'date' rule that never ends. Only the null active field
// is touched, so an existing value is never clobbered.
watch(() => model.value.endMode, (mode) => {
  const seeded = seedEndField(mode, model.value, todayCivilDayEpoch())
  model.value.endCount = seeded.endCount
  model.value.endDate = seeded.endDate
}, { immediate: true })

const endModeOptions = computed(() => [
  { label: t('recurrences.end.never'), value: 'never' },
  { label: t('recurrences.end.date'), value: 'date' },
  { label: t('recurrences.end.count'), value: 'count' },
])

const endDate = computed({
  get: () => model.value.endDate,
  set: (v: number | null) => {
    model.value.endDate = v
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
      <!-- No `clearable`: the way to remove an end date is End = Never; clearing here would null
           endDate while still in 'date' mode and silently make the series run forever. -->
      <FormDate
        v-if="model.endMode === 'date'"
        v-model="endDate"
        class="mt-2"
      />
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
