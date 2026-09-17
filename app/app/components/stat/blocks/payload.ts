import { z } from 'zod'
import { periods } from '~~/utils/date/types'

import type FilterChipsView from '~/components/filter/ChipsView.vue'
import type StatCategoriesListView from '~/components/stat/categories/ListView.vue'
import type StatCategoriesRoundListView from '~/components/stat/categories/RoundListView.vue'
import type StatCategoriesVerticalListView from '~/components/stat/categories/VerticalListView.vue'
import type StatChartView from '~/components/stat/chart/View.vue'
import type StatSumView from '~/components/stat/sum/View.vue'
import type StatWalletsView from '~/components/stat/wallets/View.vue'
import type TrnsItem from '~/components/trns/Item.vue'

import { categoryFormSchema } from '~/components/categories/types'
import { filterExtrasSchema } from '~/components/filter/extras'
import { chartTypes } from '~/components/stat/chart/types'
import { categoryListBackgroundTypes, categoryListTrendTypes, ConfigSchema } from '~/components/stat/config/schema'
import { trnItemSchema } from '~/components/trns/types'
import { walletItemSchema } from '~/components/wallets/types'

/**
 * Serializable payloads for every pure stat view. An agent (or any producer) emits one of these;
 * `StatBlocksRenderer` validates it and mounts the same component the dashboard uses.
 * Each schema `satisfies` the props of the view it feeds, so a prop change fails the build here.
 */

type Props<T> = T extends new (...args: never[]) => { $props: infer P } ? Omit<P, `on${string}`> : never

const seriesSlug = z.enum(['expense', 'income', 'net'])
const category = categoryFormSchema
const walletComputed = z.intersection(walletItemSchema, z.object({ amount: z.number(), rate: z.number().optional() }))

const sumRecord = z.object({
  amount: z.number(),
  average: z.number().optional(),
  averageByPeriod: z.record(z.string(), z.number()).optional(),
  isActive: z.boolean().optional(),
  type: seriesSlug,
})

const sumsPayload = z.object({
  currencyCode: z.string(),
  focused: sumRecord.nullable().optional(),
  items: z.array(sumRecord),
  single: sumRecord.nullable().optional(),
}) satisfies z.ZodType<Props<typeof StatSumView>>

const categoryWithData = z.object({
  categories: z.array(z.object({ id: z.string(), name: z.string(), trend: z.array(z.number()).optional(), trnsIds: z.array(z.string()), value: z.number() })).optional(),
  id: z.string(),
  name: z.string(),
  trend: z.array(z.number()).optional(),
  trnsIds: z.array(z.string()),
  value: z.number(),
})

const categoryLeafRow = z.object({
  category,
  item: categoryWithData,
  parentCategory: category.optional(),
})
const categoryRow = categoryLeafRow.extend({ children: z.array(categoryLeafRow).optional() })
const maxCategoryValues = z.object({ expense: z.number(), income: z.number() })

const categoriesListPayload = z.object({
  backgroundType: z.enum(categoryListBackgroundTypes).default('none'),
  childrenMaxCategoryValues: maxCategoryValues.optional(),
  currencyCode: z.string(),
  expandedIds: z.array(z.string()).optional(),
  isLines: z.boolean().default(false),
  isRoundIcon: z.boolean().default(true),
  isShowParent: z.boolean().default(false),
  maxCategoryValues,
  rows: z.array(categoryRow),
  trendType: z.enum(categoryListTrendTypes).default('bar'),
}) satisfies z.ZodType<Props<typeof StatCategoriesListView>>

const categoriesRoundPayload = z.object({
  currencyCode: z.string(),
  isIconBg: z.boolean().default(true),
  isInlineAmount: z.boolean().default(true),
  isShowAmount: z.boolean().default(true),
  isShowParent: z.boolean().default(false),
  rows: z.array(categoryLeafRow),
  selectedIds: z.array(z.string()).optional(),
}) satisfies z.ZodType<Props<typeof StatCategoriesRoundListView>>

const categoriesVerticalPayload = z.object({
  backgroundType: z.enum(categoryListBackgroundTypes).default('none'),
  currencyCode: z.string(),
  isLines: z.boolean().default(false),
  isRoundIcon: z.boolean().default(true),
  isShowTooltip: z.boolean().default(true),
  isShowTooltipChildren: z.boolean().default(false),
  maxCategoryValues,
  rows: z.array(categoryRow),
  trendType: z.enum(categoryListTrendTypes).default('bar'),
}) satisfies z.ZodType<Props<typeof StatCategoriesVerticalListView>>

const seriesSlugPair = z.enum(['expense', 'income'])
const chartSeries = z.object({
  averageMode: z.enum(['series', 'stack']).optional(),
  axisOverlay: z.boolean().optional(),
  color: z.string().optional(),
  data: z.array(z.number()),
  icon: z.string().optional(),
  markArea: z.object({
    data: z.array(z.tuple([z.object({ xAxis: z.string() }), z.object({ xAxis: z.string() })])),
    itemStyle: z.object({ borderWidth: z.number(), color: z.string(), opacity: z.number() }),
  }).optional(),
  markedArea: z.literal('markedArea').optional(),
  markLine: z.record(z.string(), z.unknown()).optional(),
  markLineValueType: seriesSlugPair.optional(),
  name: z.string(),
  showValueType: z.boolean().optional(),
  type: z.enum(['bar', 'line']),
  valueTypes: z.array(seriesSlugPair.optional()).optional(),
})

const chartPayload = z.object({
  chartConfig: ConfigSchema.shape.chart,
  chartType: z.enum(chartTypes),
  isShowMaxRange: z.boolean().optional(),
  period: z.enum(periods),
  range: z.object({ end: z.number(), start: z.number() }),
  series: z.array(chartSeries),
  xAxisLabels: z.array(z.number()),
}) satisfies z.ZodType<Props<typeof StatChartView>>

const walletsPayload = z.object({
  isShowIcon: z.boolean().default(true),
  items: z.array(z.object({
    amount: z.number().optional(),
    isSelected: z.boolean().default(false),
    wallet: walletComputed,
    walletId: z.string(),
  })),
}) satisfies z.ZodType<Props<typeof StatWalletsView>>

const [transactionSchema, transferSchema] = trnItemSchema.options
const trnFullBase = z.object({ category, categoryParent: category.optional(), id: z.string() })
const trnItemFull = z.union([
  transactionSchema.extend({ ...trnFullBase.shape, wallet: walletItemSchema }),
  transferSchema.extend({ ...trnFullBase.shape, expenseWallet: walletItemSchema, incomeWallet: walletItemSchema }),
])

const trnsPayload = z.object({
  rows: z.array(z.object({ date: z.string().optional(), trnItem: trnItemFull }) satisfies z.ZodType<Props<typeof TrnsItem>>),
})

const chip = z.intersection(z.object({ key: z.string(), tooltip: z.string() }), z.discriminatedUnion('kind', [
  z.object({ category, categoryId: z.string(), kind: z.literal('category') }),
  z.object({ icon: z.string(), kind: z.literal('extra'), label: z.string(), patch: filterExtrasSchema.partial() }),
  z.object({ kind: z.literal('wallet'), wallet: walletComputed, walletId: z.string() }),
]))

const chipsPayload = z.object({ chips: z.array(chip) }) satisfies z.ZodType<Props<typeof FilterChipsView>>

export const statBlockPayload = z.discriminatedUnion('type', [
  z.object({ props: sumsPayload, type: z.literal('sums') }),
  z.object({ props: categoriesListPayload, type: z.literal('categoriesList') }),
  z.object({ props: categoriesRoundPayload, type: z.literal('categoriesRound') }),
  z.object({ props: categoriesVerticalPayload, type: z.literal('categoriesVertical') }),
  z.object({ props: chartPayload, type: z.literal('chart') }),
  z.object({ props: walletsPayload, type: z.literal('wallets') }),
  z.object({ props: trnsPayload, type: z.literal('trns') }),
  z.object({ props: chipsPayload, type: z.literal('chips') }),
])

export type StatBlockPayload = z.infer<typeof statBlockPayload>
export type StatBlockType = StatBlockPayload['type']

export function parseStatBlockPayload(input: unknown) {
  return statBlockPayload.safeParse(input)
}
