import { z } from 'zod/v4'

import { random } from '~/assets/js/emo'
import icons from '~/assets/js/icons'
import { colorsArray } from '~/components/color/colors'

export type CategoryId = string

export const categoryFormSchema = z.object({
  color: z.string().default(() => random(colorsArray)),
  icon: z.string().trim().min(1).default(() => random(random(icons))),
  name: z.string().trim().min(1).default(''),
  parentId: z.union([z.string(), z.literal(0)]).default(0),
  showInLastUsed: z.boolean().default(true),
  showInQuickSelector: z.boolean().default(false),
})

export type CategoryForm = z.infer<typeof categoryFormSchema>

export type CategoryItem = CategoryForm & {
  childIds?: CategoryId[]
  updatedAt?: number
}

export type CategoryItemWithId = CategoryItem & {
  id: CategoryId
}

export type Categories = Record<CategoryId, CategoryItem> & Record<'transfer', CategoryItem>

export type AddCategoryParams = {
  id: CategoryId
  isUpdateChildCategoriesColor: boolean
  values: CategoryItem
}
