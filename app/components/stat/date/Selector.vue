<script setup lang="ts">
import type { Grouped, Range, StatDateProvider } from '~/components/date/types'

import { getUCalendarToday, parseUCalendarDate } from '~/components/date/utils'

const emit = defineEmits<{
  onClose: []
}>()

const { t } = useI18n()
const statDate = inject('statDate') as StatDateProvider

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

function onSelectRange(value: unknown) {
  const range = {
    end: value.end,
    start: value.start,
  } as Range

  statDate.setRangeByCalendar(range)
  emit('onClose')
}
</script>

<template>
  <div>
    <UiTabs1 class="mb-2">
      <UiTabsItem1
        v-for="tab in tabs.items.value"
        :key="tab"
        :title="t(tab)"
        :isActive="tabs.selected.value === tab"
        @click="tabs.selected.value = tab"
      >
        {{ t(`dates.calendar.${tab}`) }}
      </UiTabsItem1>
    </UiTabs1>

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
          @onClose="emit('onClose')"
        />

        <div class="flex flex-wrap gap-1">
          <DateRanges
            :statDate
            view="presets"
            @onClose="emit('onClose')"
          />
        </div>

        <div class="flex flex-wrap gap-1">
          <DateRanges
            :statDate
            view="maximum"
            @onClose="emit('onClose')"
          />
        </div>
      </div>

      <!-- Grouped by -->
      <div class="grid gap-3">
        <UiTitleOption class="px-1">
          {{ t('dates.calendar.intervalsGrouped') }}
        </UiTitleOption>

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
      v-model="dateRange"
      :maxValue="getUCalendarToday()"
      :numberOfMonths="2"
      range
      @update:modelValue="onSelectRange"
    />
  </div>
</template>
