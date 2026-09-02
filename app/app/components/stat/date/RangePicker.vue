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
const isGranularityOpen = useStoredToggle('stat-date-granularity', true)
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
      class="grid gap-4 pt-2"
    >
      <!-- Presets -->
      <div class="grid grid-cols-2 items-start gap-3">
        <div class="grid gap-1">
          <StatDateRanges
            :statDate
            vertical
            view="periods"
            @close="emit('close')"
          />

          <StatDateRanges
            isShowRangeAdjust
            :statDate
            vertical
            view="maximum"
            @close="emit('close')"
          />
        </div>

        <div class="grid gap-3">
          <StatDateRanges
            :statDate
            presetUnit="day"
            vertical
            view="presets"
            @close="emit('close')"
          />

          <StatDateRanges
            :statDate
            presetUnit="month"
            vertical
            view="presets"
            @close="emit('close')"
          />

          <StatDateRanges
            :statDate
            presetUnit="year"
            vertical
            view="presets"
            @close="emit('close')"
          />
        </div>
      </div>

      <UCollapsible v-model:open="isGranularityOpen">
        <button
          type="button"
          class="-my-0.25 flex min-h-10.5 w-full items-center gap-1 overflow-hidden rounded-md border border-transparent interactive px-3 py-1.5 text-left"
          :aria-expanded="isGranularityOpen"
        >
          <UiEntityName>
            {{ t('dates.calendar.granularity') }}
          </UiEntityName>
          <Icon
            :name="isGranularityOpen ? 'lucide:chevron-down' : 'lucide:chevron-right'"
            class="shrink-0 text-muted"
            size="18"
          />
        </button>

        <template #content>
          <div class="grid gap-3 pt-2">
            <UiTabs
              size="xs"
              :items="granularityItems"
              :modelValue="statDate.params.value.granularityBy"
              @update:modelValue="onSelectGranularityBy"
            />

            <UiNumberStepper
              :modelValue="statDate.params.value.granularityDuration"
              :min="1"
              @update:modelValue="statDate.setGranularityDuration"
            />
          </div>
        </template>
      </UCollapsible>
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
