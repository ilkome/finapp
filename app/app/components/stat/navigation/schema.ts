import { z } from 'zod/v4'

import { ConfigSchema } from '~/components/stat/config/schema'
import { statDateParamsSchema } from '~/components/stat/date/params'
import { statReportTypes } from '~/components/stat/types'
import { trnsViewTypes } from '~/components/trns/types'

export const STAT_NAVIGATION_SNAPSHOT_VERSION = 2

export const statNavigationSnapshotSchema = z.object({
  config: ConfigSchema,
  createdAt: z.number(),
  date: statDateParamsSchema,
  reportType: z.enum(statReportTypes),
  trns: z.object({
    filterBy: z.enum(trnsViewTypes),
    isShowWithDesc: z.boolean(),
  }),
  version: z.literal(STAT_NAVIGATION_SNAPSHOT_VERSION),
})
