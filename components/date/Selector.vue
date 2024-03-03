<script setup lang="ts">
import { useFilter } from '~/components/filter/useFilter'
import usePeriods from '~/components/periods/usePeriods'
import { getMaxPeriodsToShow } from '~/components/date/helpers'
import { getOldestTrnDate } from '~/components/trns/helpers'
import { useChart } from '~/components/chart/useChart'
import type { PeriodNameWithAll, PeriodSchema } from '~/components/chart/useChart'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import '~/components/modal/styles/modalLinks.styl'

// TODO: Hight
const { periodsNames } = usePeriods()
const { periods, setElementsToChart } = useChart()
const filterStore = useFilter()
const trnsStore = useTrnsStore()

function onSelectPeriodName(periodName: PeriodNameWithAll, close: () => void) {
  close()
  filterStore.setPeriod(periodName)
}

// TODO: duplicate computed
const maxPeriodsNumber = computed(() => {
  const trnsItems = trnsStore.items
  const oldestTrnDate = getOldestTrnDate(trnsItems)
  return getMaxPeriodsToShow(filterStore.periodWithoutAll, oldestTrnDate)
})

const periodCounts = [1, 3, 6, 7, 12, 14, 16, 24, 30, 36, 48, 60]

function onSelectPeriodCount(number: PeriodSchema['showedPeriods'], close: () => void) {
  close()
  setElementsToChart(number)
}
</script>

<template lang="pug">
Teleport(to="body")
  LazyBaseBottomSheet(
    @closed="$emit('close')"
  )
    template(#handler="{ close }")
      BaseBottomSheetHandler
      BaseBottomSheetClose(@onClick="close")

    template(#default="{ close }")
      .title {{ $t('dates.period') }}

      .content
        //- Periods
        .modalLinks
          ModalButton(
            v-for="periodItem in periodsNames"
            :key="periodItem.slug"
            :icon="periodItem.icon"
            :isActive="filterStore.period === periodItem.slug"
            :name="$t(`dates.${periodItem.slug}.simple`)"
            @onClick="onSelectPeriodName(periodItem.slug, close)"
          )

          ModalButton(
            :isActive="filterStore.period === 'all'"
            :name="$t('dates.all.simple')"
            icon="mdi mdi-database"
            @onClick="onSelectPeriodName('all', close)"
          )

        //- Counts
        template(v-if="filterStore.period !== 'all'")
          .title {{ $t('dates.count') }}
          .counts.flex.items-center.justify-center
            .countsItem(
              v-for="periodCount in periodCounts"
              :key="periodCount"
              :class="{ _active: periodCount === periods[filterStore.periodWithoutAll].showedPeriods }"
              @click="onSelectPeriodCount(periodCount, close)"
            ) {{ periodCount }}

            .countsItem(
              :class="{ _active: maxPeriodsNumber === periods[filterStore.periodWithoutAll].showedPeriods }"
              @click="onSelectPeriodCount(maxPeriodsNumber, close)"
            ) {{ maxPeriodsNumber }}

        //- Close button
        .pb-4.px-2.flex.justify-evenly.gap-6
          .cursor-pointer.grow.py-3.px-5.flex-center.rounded-full.text-sm.bg-item-main-bg.hocus_bg-item-main-hover(
            class="basis-1/2 max-w-[280px]"
            @click="close()"
          ) {{ $t('close') }}
</template>

<style lang="stylus" scoped>
@import "../assets/stylus/variables"

.counts
  flex-flow row wrap
  gap 16px
  padding 10px 26px

  &Item
    cursor pointer
    display flex
    align-items center
    justify-content center
    width 48px
    height 48px
    padding 20px 16px
    font-secondary()
    font-size 18px
    text-align center
    background #1c1c1c
    border 1px solid transparent
    border-radius 50%

    +media-hover()
      &:not(._active)
        color var(--c-text-1)
        background var(--c-item-bg-hover)
        border-color var(--c-item-bd-hover)

    &._active
      background var(--c-item-bg-active)
      border-color var(--c-item-bd-main)

.content
  background var(--c-bg-3)
  +media(600px)
    border-radius 0 0 16px 16px

.title
  padding 26px
  padding-bottom 10px
  color var(--c-font-2)
  fontFamilyNunito()
  font-size 28px
  font-weight 700
  text-align center
  background var(--c-bg-3)
  border-radius 16px 16px 0 0
</style>
