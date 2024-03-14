<script setup lang="ts">
import { getMaxPeriodsToShow } from '~/components/date/helpers'
import { getOldestTrnDate } from '~/components/trns/helpers'
import { useChartStore } from '~/components/chart/useChartStore'
import type {
  PeriodName,
  PeriodNameWithAll,
  PeriodSchema,
} from '~/components/chart/useChartStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import '~/components/modal/styles/modalLinks.styl'

const closeDateSelector = inject('closeDateSelector') as () => void
const period = inject('period') as Ref<PeriodNameWithAll>
const periodWithoutAll = inject('periodWithoutAll') as Ref<PeriodName>
const setPeriodAndDate = inject('setPeriodAndDate') as (period: PeriodNameWithAll) => void

const chartStore = useChartStore()
const trnsStore = useTrnsStore()

function onSelectPeriodName(periodName: PeriodNameWithAll, close: () => void) {
  close()
  setPeriodAndDate(periodName)
}

// TODO: duplicate computed
const maxPeriodsNumber = computed(() => {
  const trnsItems = trnsStore.items
  const oldestTrnDate = getOldestTrnDate(trnsItems)
  return getMaxPeriodsToShow(periodWithoutAll.value, oldestTrnDate)
})

const periodCounts = [1, 3, 6, 7, 12, 14, 16, 24, 30, 36, 48, 60]

function onSelectPeriodCount(
  number: PeriodSchema['showedPeriods'],
  close: () => void,
) {
  close()
  chartStore.setElementsToChart(number)
}
</script>

<template>
  <Teleport to="body">
    <LazyBaseBottomSheet @closed="closeDateSelector">
      <template #handler="{ close }">
        <BaseBottomSheetHandler />
        <BaseBottomSheetClose @onClick="close" />
      </template>

      <template #default="{ close }">
        <div class="title">
          {{ $t("dates.period") }}
        </div>

        <div class="content">
          <!-- Periods -->
          <div class="grid gap-2 px-3">
            <ModalButton2
              v-for="periodItem in chartStore.periodsNames"
              :key="periodItem.slug"
              :isActive="period === periodItem.slug"
              :name="$t(`dates.${periodItem.slug}.simple`)"
              @click="onSelectPeriodName(periodItem.slug, close)"
            >
              <template #icon>
                <div :class="periodItem.icon" />
              </template>
            </ModalButton2>

            <ModalButton2
              :isActive="period === 'all'"
              :name="$t('dates.all.simple')"
              @click="onSelectPeriodName('all', close)"
            >
              <template #icon>
                <div class="mdi mdi-database" />
              </template>
            </ModalButton2>
          </div>

          <!-- Counts -->
          <template v-if="period !== 'all'">
            <div class="title">
              {{ $t("dates.count") }}
            </div>
            <div class="counts flex items-center justify-center">
              <div
                v-for="periodCount in periodCounts"
                :key="periodCount"
                :class="{
                  _active:
                    periodCount
                    === chartStore.periods[periodWithoutAll].showedPeriods,
                }"
                class="countsItem"
                @click="onSelectPeriodCount(periodCount, close)"
              >
                {{ periodCount }}
              </div>

              <div
                :class="{
                  _active:
                    maxPeriodsNumber
                    === chartStore.periods[periodWithoutAll].showedPeriods,
                }"
                class="countsItem"
                @click="onSelectPeriodCount(maxPeriodsNumber, close)"
              >
                {{ maxPeriodsNumber }}
              </div>
            </div>
          </template>

          <!-- Close button -->
          <div class="flex justify-evenly gap-6 px-2 pb-4">
            <div
              class="flex-center max-w-[280px] grow basis-1/2 cursor-pointer rounded-full bg-item-4 px-5 py-3 text-sm hocus_bg-item-5"
              @click="close()"
            >
              {{ $t("close") }}
            </div>
          </div>
        </div>
      </template>
    </LazyBaseBottomSheet>
  </Teleport>
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
        border-color var(--accent-4)

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
  font-secondary()
  font-size 28px
  font-weight 700
  text-align center
  background var(--c-bg-3)
  border-radius 16px 16px 0 0
</style>
