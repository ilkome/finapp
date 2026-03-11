<script setup lang="ts">
import type { Grouped, Range } from '~/components/date/types'

import { getUCalendarToday, parseUCalendarDate } from '~/components/date/utils'
import { statDateKey } from '~/components/stat/injectionKeys'

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const statDate = inject(statDateKey)!

const tabs = {
  items: ref(['presets', 'calendar']),
  selected: ref('presets'),
}

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

function selectInterval(grouped: Grouped) {
  statDate.setInterval(grouped)
}

const dateRange = ref({
  end: parseUCalendarDate(statDate.range.value.end),
  start: parseUCalendarDate(statDate.range.value.start),
})

function onSelectRange(value: any) {
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
    <UiTabsBar class="mb-2">
      <UiTabsItemFill
        v-for="tab in tabs.items.value"
        :key="tab"
        :title="t(tab)"
        :isActive="tabs.selected.value === tab"
        @click="tabs.selected.value = tab"
      >
        {{ t(`dates.calendar.${tab}`) }}
      </UiTabsItemFill>
    </UiTabsBar>

    <div
      v-if="tabs.selected.value === 'presets'"
      class="grid gap-6 pt-4"
    >
      <!-- Presets -->
      <div class="grid gap-4">
        <DateRanges
          :statDate
          isShowRangeAdjust
          view="periods"
          @close="emit('close')"
        />

        <div class="flex flex-wrap gap-1">
          <DateRanges
            :statDate
            view="presets"
            @close="emit('close')"
          />
        </div>

        <div class="flex flex-wrap gap-1">
          <DateRanges
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
          <div class="flex flex-wrap gap-1">
            <DateLinkItem
              v-for="item in intervals"
              :key="item.intervalsBy"
              :isActive="item.intervalsBy === statDate.params.value.intervalsBy"
              @click="selectInterval(item)"
            >
              {{ t(`dates.${item.intervalsBy}.simple`) }}
            </DateLinkItem>

            <div class="border-default bg-default flex gap-1 rounded-sm border p-px">
              <DateLinkItem @click="statDate.delInterval">
                -
              </DateLinkItem>
              <DateLinkItemNoBg>
                {{ statDate.params.value.intervalsDuration }}
              </DateLinkItemNoBg>
              <DateLinkItem @click="statDate.addInterval">
                +
              </DateLinkItem>
            </div>
          </div>
        </div>
      </div>
    </div>

    <UCalendar
      v-if="tabs.selected.value === 'calendar'"
      v-model="(dateRange as any)"
      :maxValue="getUCalendarToday()"
      :numberOfMonths="2"
      range
      @update:modelValue="onSelectRange"
    />
  </div>
</template>
