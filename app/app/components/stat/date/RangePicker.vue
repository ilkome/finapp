<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import type { Range } from '~~/utils/date/types'

import { getUCalendarToday, parseUCalendarDate } from '~~/utils/date/calendar'

import type { Grouped } from '~/components/stat/date/types'

import { statDateKey } from '~/components/stat/injectionKeys'

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const statDate = inject(statDateKey)!

const viewTab = ref<'presets' | 'calendar'>('presets')
const viewTabItems = computed<TabsItem[]>(() => [
  { label: t('dates.calendar.presets'), value: 'presets' },
  { label: t('dates.calendar.calendar'), value: 'calendar' },
])

const granularities = computed<Grouped[]>(() => [{
  granularityBy: 'day',
  granularityDuration: 1,
}, {
  granularityBy: 'week',
  granularityDuration: 1,
}, {
  granularityBy: 'month',
  granularityDuration: 1,
}, {
  granularityBy: 'year',
  granularityDuration: 1,
}])

const granularityItems = computed<TabsItem[]>(() => granularities.value.map(item => ({
  label: t(`dates.${item.granularityBy}.simple`),
  value: item.granularityBy,
})))

function selectGranularity(grouped: Grouped) {
  statDate.setGranularity(grouped)
}

function onSelectGranularityBy(granularityBy: string | number) {
  const grouped = granularities.value.find(i => i.granularityBy === granularityBy)
  if (grouped)
    selectGranularity(grouped)
}

const dateRange = ref({
  end: parseUCalendarDate(statDate.range.value.end),
  start: parseUCalendarDate(statDate.range.value.start),
})

function onSelectRange(value: { end: unknown, start: unknown }) {
  const range = {
    end: value.end,
    start: value.start,
  } as Range

  statDate.setRangeByCalendar(range)
  emit('close')
}
</script>

<template>
  <div>
    <UiTabs
      v-model="viewTab"
      isEqual
      class="mb-2"
      :items="viewTabItems"
    />

    <div
      v-if="viewTab === 'presets'"
      class="grid gap-6 pt-4"
    >
      <!-- Presets -->
      <div class="grid gap-4">
        <StatDateRanges
          :statDate
          isShowRangeAdjust
          view="periods"
          @close="emit('close')"
        />

        <div class="flex flex-wrap gap-1">
          <StatDateRanges
            :statDate
            view="presets"
            @close="emit('close')"
          />
        </div>

        <div class="flex flex-wrap gap-1">
          <StatDateRanges
            :statDate
            view="maximum"
            @close="emit('close')"
          />
        </div>
      </div>

      <!-- Grouped by -->
      <div class="grid gap-3">
        <UiTitleSection size="sm" class="px-1">
          {{ t('dates.calendar.granularity') }}
        </UiTitleSection>

        <div class="grid gap-2">
          <div class="flex flex-wrap items-center gap-1">
            <UiTabs
              size="sm"
              :items="granularityItems"
              :modelValue="statDate.params.value.granularityBy"
              @update:modelValue="onSelectGranularityBy"
            />

            <UiInlineStepper
              :value="statDate.params.value.granularityDuration"
              @dec="statDate.minusGranularity"
              @inc="statDate.plusGranularity"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- @vue-ignore -->
    <UCalendar
      v-if="viewTab === 'calendar'"
      v-model="dateRange"
      :maxValue="getUCalendarToday()"
      :numberOfMonths="2"
      range
      @update:modelValue="onSelectRange"
    />
  </div>
</template>
