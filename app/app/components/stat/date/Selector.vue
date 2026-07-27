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

const intervals = computed<Grouped[]>(() => [{
  intervalsBy: 'day',
  intervalsDuration: 1,
}, {
  intervalsBy: 'week',
  intervalsDuration: 1,
}, {
  intervalsBy: 'month',
  intervalsDuration: 1,
}, {
  intervalsBy: 'year',
  intervalsDuration: 1,
}])

const intervalItems = computed<TabsItem[]>(() => intervals.value.map(item => ({
  label: t(`dates.${item.intervalsBy}.simple`),
  value: item.intervalsBy,
})))

function selectInterval(grouped: Grouped) {
  statDate.setInterval(grouped)
}

function onSelectIntervalBy(intervalsBy: string | number) {
  const grouped = intervals.value.find(i => i.intervalsBy === intervalsBy)
  if (grouped)
    selectInterval(grouped)
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
    <UTabs
      v-model="viewTab"
      :content="false"
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
          {{ t('dates.calendar.intervalsGrouped') }}
        </UiTitleSection>

        <div class="grid gap-2">
          <div class="flex flex-wrap items-center gap-1">
            <UTabs
              :content="false"
              size="sm"
              :items="intervalItems"
              :modelValue="statDate.params.value.intervalsBy"
              @update:modelValue="onSelectIntervalBy"
            />

            <UiInlineStepper
              :value="statDate.params.value.intervalsDuration"
              @dec="statDate.delInterval"
              @inc="statDate.addInterval"
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
