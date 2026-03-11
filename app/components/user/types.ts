import { z } from 'zod/v4'

import { localeSchema } from '~/components/locale/types'

export const userSettingsSchema = z.object({
  baseCurrency: z.string().min(1).default('USD'),
  locale: localeSchema.optional(),
})

export type UserSettings = z.infer<typeof userSettingsSchema>
