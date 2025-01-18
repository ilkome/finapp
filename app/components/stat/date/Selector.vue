<script setup lang="ts">
import type { Grouped, Range, StatDateProvider } from '~/components/date/types'

const emit = defineEmits<{
  onClose: []
}>()

function close() {
  emit('onClose')
}

const { t } = useI18n()
const statDate = inject('statDate') as StatDateProvider

const tabs = {
  items: ref(['presets', 'calendar']),
  selected: ref('presets'),
}

function setMaxRange(isSkipEmpty = false) {
  emit('onClose')
  statDate.setMaxRange(isSkipEmpty)
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
        {{ t(tab) }}
      </UiTabsItem1>
    </UiTabs1>

    <div
      v-if="tabs.selected.value === 'presets'"
      class="grid gap-6"
    >
      <!-- Presets -->
      <div class="grid gap-2">
        <div class="flex flex-wrap gap-1">
          <DateRanges
            :statDate
            view="periods"
            isShowRangeAdjust
            @onClose="emit('onClose')"
          />
        </div>

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
          {{ t('intervalsGrouped') }}
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

            <div class="flex">
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

    <DatePicker
      v-if="tabs.selected.value === 'calendar'"
      mode="range"
      :rows="2"
      :value="statDate.range.value"
      @update:modelValue="(v: Range) => {
        console.log('v', v)
        statDate.setRangeByCalendar(v);
        close();
      }"
    />
  </div>
</template>

<i18n lang="yaml">
en:
  all: All
  allSkipEmpty: Maximum
  calendar: Calendar
  intervalsGrouped: Grouped by
  ranges: Ranges
  presets: Presets
  last: Last
  7Days: 7d
  14Days: 14d
  30Days: 30d
  12Months: 12m
  mini: mini

ru:
  all: Все
  allSkipEmpty: Максимально
  calendar: Календарь
  intervalsGrouped: Группировка
  ranges: Диапазоны
  presets: Пресеты
  last: Последние
  7Days: 7д
  14Days: 14д
  30Days: 30д
  12Months: 12м
  mini: мини
</i18n>
