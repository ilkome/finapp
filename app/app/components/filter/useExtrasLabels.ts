import type { TabsItem } from '@nuxt/ui'

import type { ExtrasChipLabels } from '~/components/filter/extras'

/** Every label the extras filter shows, built once from i18n for the form, the chips and the summary. */
export function useExtrasLabels() {
  const { t } = useI18n()

  const chipLabels = computed<ExtrasChipLabels>(() => ({
    amount: t('trns.fields.amount'),
    desc: t('trns.fields.description'),
    descMode: {
      with: t('trns.filter.withDescription'),
      without: t('trns.filter.withoutDescription'),
    },
    search: t('base.search'),
    type: t('trns.fields.type'),
    types: {
      adjustment: t('trns.types.adjustment'),
      expense: t('trns.types.expense'),
      income: t('trns.types.income'),
      transfer: t('trns.types.transfer'),
    },
  }))

  const typeItems = computed<TabsItem[]>(() => [
    { label: t('trns.filter.allTypes'), value: 'all' },
    ...(['expense', 'income', 'transfer', 'adjustment'] as const).map(value => ({ label: chipLabels.value.types[value], value })),
  ])

  const descItems = computed<TabsItem[]>(() => [
    { label: t('trns.filter.allDescriptions'), value: 'all' },
    ...(['with', 'without'] as const).map(value => ({ label: chipLabels.value.descMode[value], value })),
  ])

  return { chipLabels, descItems, typeItems }
}
