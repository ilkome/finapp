<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import type { Range } from '~~/utils/date/types'

import { getUCalendarToday, parseUCalendarDate } from '~~/utils/date/calendar'

import type { Grouped, StatDateRangeParams } from '~/components/stat/date/types'
import type { StatDateRangeOption } from '~/components/stat/date/useRangeOptions'

const props = defineProps<{
  granularity: Grouped
  options: StatDateRangeOption[]
  params: StatDateRangeParams
  range: Range
}>()

const emit = defineEmits<{
  close: []
  selectGranularityBy: [granularityBy: Grouped['granularityBy']]
  selectRange: [option: StatDateRangeOption]
  setGranularityDuration: [duration: number]
  setRangeByCalendar: [range: Range]
  setRangeDuration: [duration: number]
}>()

const isGranularityOpen = defineModel<boolean>('isGranularityOpen', { default: true })

const { t } = useI18n()

const viewTab = ref<'presets' | 'calendar'>('presets')
const viewTabItems = computed<TabsItem[]>(() => [
  { label: t('dates.calendar.presets'), value: 'presets' },
  { label: t('dates.calendar.calendar'), value: 'calendar' },
])

const granularityItems = computed<TabsItem[]>(() => (['day', 'week', 'month'] as const).map(by => ({
  label: t(`dates.${by}.simple`),
  value: by,
})))

const dateRange = ref({
  end: parseUCalendarDate(props.range.end),
  start: parseUCalendarDate(props.range.start),
})

function onSelectRange(value: { end: unknown, start: unknown }) {
  emit('setRangeByCalendar', { end: value.end, start: value.start } as Range)
  emit('close')
}

function onSelectOption(option: StatDateRangeOption) {
  emit('selectRange', option)
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
          <StatDateRangesView
            :options
            :params
            vertical
            view="periods"
            @select="onSelectOption"
          />

          <StatDateRangesView
            isShowRangeAdjust
            :options
            :params
            vertical
            view="maximum"
            @select="onSelectOption"
            @updateRangeDuration="emit('setRangeDuration', $event)"
          />
        </div>

        <div class="grid gap-3">
          <StatDateRangesView
            v-for="presetUnit in (['day', 'month', 'year'] as const)"
            :key="presetUnit"
            :options
            :params
            :presetUnit
            vertical
            view="presets"
            @select="onSelectOption"
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
              :modelValue="props.granularity.granularityBy"
              @update:modelValue="emit('selectGranularityBy', $event as Grouped['granularityBy'])"
            />

            <UiNumberStepper
              :modelValue="props.granularity.granularityDuration"
              :min="1"
              @update:modelValue="emit('setGranularityDuration', $event)"
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
