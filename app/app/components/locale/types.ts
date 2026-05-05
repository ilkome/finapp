import { z } from 'zod/v4'

export const localeSchema = z.enum(['en', 'ru'])
export type LocaleSlug = z.infer<typeof localeSchema>
