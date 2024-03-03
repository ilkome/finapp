import type { AppNav } from '~/components/app/types'
import { useStat } from '~/components/stat/useStat'
import { useFilter } from '~/components/filter/useFilter'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

export default function useStatPage() {
  const { $i18n } = useNuxtApp()
  const trnsStore = useTrnsStore()
  const filterStore = useFilter()
  const { statCurrentPeriod, statAverage } = useStat()
  const isShowFilter = computed(() => filterStore.catsIds.length > 0 || filterStore.walletsIds.length > 0)
  const isHasTrns = computed(() => trnsStore.hasTrns)

  const menu = computed<{
    idx: number
    id: AppNav
    name: string | unknown
  }[]>(() => [{
    idx: 0,
    id: 'summary',
    name: $i18n.t('stat.periods'),
  }, {
    idx: 1,
    id: 'expense',
    name: $i18n.t('money.expense'),
  }, {
    idx: 2,
    id: 'income',
    name: $i18n.t('money.income'),
  }, {
    idx: 3,
    id: 'trns',
    name: $i18n.t('trns.shortTitle'),
  }])

  return {
    statPage: reactive({
      average: statAverage,
      current: statCurrentPeriod,

      filter: {
        ...filterStore.values,
        isShow: isShowFilter,
        period: filterStore.period,
        date: filterStore.date,
      },

      isHasTrns,
    }),

    menu,
  }
}
