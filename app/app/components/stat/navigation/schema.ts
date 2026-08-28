import { z } from 'zod/v4'

import { ConfigSchema } from '~/components/stat/config/schema'
import { statDateParamsSchema } from '~/components/stat/date/params'
import { seriesSlugsSelected, statReportTypes } from '~/components/stat/types'
import { trnsViewTypes } from '~/components/trns/types'

export const STAT_NAVIGATION_SNAPSHOT_VERSION = 2

export const statNavigationSnapshotSchema = z.object({
  config: ConfigSchema,
  createdAt: z.number(),
  date: statDateParamsSchema,
  filteredType: z.enum(seriesSlugsSelected).optional(),
  reportType: z.enum(statReportTypes),
  trns: z.object({
    filterBy: z.enum(trnsViewTypes),
    isShowHistoryWithDesc: z.boolean().optional(),
    isShowWithDesc: z.boolean(),
  }),
  version: z.literal(STAT_NAVIGATION_SNAPSHOT_VERSION),
})
