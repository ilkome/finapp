import { z } from 'zod/v4'

import { ConfigSchema } from '~/components/stat/config/schema'
import { statDateParamsSchema } from '~/components/stat/date/params'
import { statTabSlugs } from '~/components/stat/types'
import { trnsViewTypes } from '~/components/trns/types'

export const STAT_NAVIGATION_SNAPSHOT_VERSION = 1

export const statNavigationSnapshotSchema = z.object({
  activeTab: z.enum(statTabSlugs),
  config: ConfigSchema,
  createdAt: z.number(),
  date: statDateParamsSchema,
  trns: z.object({
    filterBy: z.enum(trnsViewTypes),
    isShowWithDesc: z.boolean(),
  }),
  version: z.literal(STAT_NAVIGATION_SNAPSHOT_VERSION),
})
