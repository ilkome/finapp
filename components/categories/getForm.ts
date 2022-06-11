import icons from '~/assets/js/icons'
import type { CategoryForm } from '~/components/categories/types'
import { allColors } from '~/assets/js/colors'
import { random } from '~/assets/js/emo'

export function getPreparedFormData(values?: any): CategoryForm {
  return {
    color: values?.color ?? random(allColors),
    icon: values?.icon ?? random(random(icons)),
    name: values?.name ?? '',
    order: values?.order ?? 1,
    parentId: values?.parentId ?? 0,
    showInLastUsed: values?.showInLastUsed ?? true,
    showInQuickSelector: values?.showInQuickSelector ?? false,
    showStat: values?.showStat ?? true,
  }
}
