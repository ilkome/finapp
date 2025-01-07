<script setup lang="ts">
import { differenceInDays } from 'date-fns'
import Swiper from 'swiper'
import 'swiper/css'

import type { Range, StatDateProvider } from '~/components/date/types'

import { calculateBestIntervalsBy } from '~/components/date/utils'

const props = defineProps<{
  maxRange: Range
}>()

const emit = defineEmits<{
  onClose: []

}>()

const { t } = useI18n()
const statDate = inject('statDate') as StatDateProvider

const sliderRef = ref<any>(null)
const sliderObj = ref<any>(null)

onMounted(() => {
  const initialSlide = 1

  sliderObj.value = new Swiper(sliderRef.value, {
    autoHeight: true,
    initialSlide,
    longSwipesMs: 60,
    longSwipesRatio: 0.1,
    observeParents: true,
    observer: true,
    shortSwipes: false,
    slidesPerView: 'auto',
    spaceBetween: 16,
    touchStartPreventDefault: false,
  })
})

function setMaxRange(isSkipEmpty = false) {
  emit('onClose')

  const rangeDuration = differenceInDays(props.maxRange.end, props.maxRange.start)
  const intervalsBy = calculateBestIntervalsBy(props.maxRange)

  statDate.setRangeByPeriod({
    intervalsBy,
    intervalsDuration: 1,
    isShowMaxRange: true,
    isSkipEmpty,
    rangeBy: 'day',
    rangeDuration,
  })
}
</script>

<template>
  <div class="relative ml-1 overflow-hidden rounded-lg bg-foreground-2">
    <div ref="sliderRef" class="swiper-container">
      <div class="swiper-wrapper">
        <!-- Recent -->
        <div class="swiper-slide !w-auto">
          <div class="flex flex-wrap">
            <DateRanges @onClose="emit('onClose')" />

            <div class="flex">
              <DateLinkItem @click="statDate.minusRange">
                -
              </DateLinkItem>
              <DateLinkItemNoBg>
                {{ statDate.params.value.rangeDuration }}
              </DateLinkItemNoBg>
              <DateLinkItem @click="statDate.plusRange">
                +
              </DateLinkItem>
            </div>
          </div>
        </div>

        <div class="swiper-slide !w-auto">
          <div class="flex flex-wrap">
            <DateRanges2 @onClose="emit('onClose')" />
          </div>
        </div>

        <div class="swiper-slide !w-auto">
          <div class="flex flex-wrap">
            <DateLinkItem
              :isActive="statDate.params.value.isShowMaxRange && !statDate.params.value.isSkipEmpty"
              @click="() => setMaxRange(false)"
            >
              {{ t('all') }}
            </DateLinkItem>
            <DateLinkItem
              :isActive="statDate.params.value.isShowMaxRange && statDate.params.value.isSkipEmpty"
              @click="() => setMaxRange(true)"
            >
              {{ t('allSkipEmpty') }}
            </DateLinkItem>
          </div>
        </div>
      </div>
    </div>
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
  intervalsGrouped: Группировка по
  ranges: Диапазоны
  presets: Пресеты
  last: Последние
  7Days: 7д
  14Days: 14д
  30Days: 30д
  12Months: 12м
  mini: мини
</i18n>
