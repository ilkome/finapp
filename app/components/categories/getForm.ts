import type { CategoryForm } from '~/components/categories/types'

import { random } from '~/assets/js/emo'
import icons from '~/assets/js/icons'
import { colorsArray } from '~/components/color/colors'

export function getPreparedFormData(values?: any): CategoryForm {
  return {
    color: values?.color ?? random(colorsArray),
    icon: values?.icon ?? random(random(icons)),
    name: values?.name ?? '',
    order: values?.order ?? 1,
    parentId: values?.parentId ?? 0,
    showInLastUsed: values?.showInLastUsed ?? true,
    showInQuickSelector: values?.showInQuickSelector ?? false,
  }
}
