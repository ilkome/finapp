/**
 * Format category.
 * @param {object} category - Category for format.
 * @param {categories} Array - List of categories.
 * @return {object} Formated category.
 */
export default function formatCategory(category, categories) {
  if (categories.length < 0) {
    console.error('formatTrn: must to have categories')
    return false
  }

  const id = category.id
  const name = category.name
  const parentId = category.parentId
  const description = category.description
  const parent = categories.find(cat => cat.id === parentId)

  if (parentId !== 0 && !parent) {
    console.error('This category should be deleted', category.name, category.id)
  }

  // Color
  let color = category.color
  if (!color) {
    if (parentId !== 0) {
      const parent = categories.find(c => c.id === parentId)
      if (parent && parent.color) {
        color = parent.color
      }
    }
  }

  // Icon
  let icon = category.icon
  if (icon) {
    if (/(mdi)/g.test(icon)) icon = `mdi ${icon}`
    if (/(fa)/g.test(icon)) icon = `fa ${icon}`
  } else {
    icon = 'fa fa-industry'
    if (parentId !== 0) {
      const parent = categories.find(c => c.id === parentId)
      if (parent && parent.icon) {
        if (/(mdi)/g.test(icon)) icon = `mdi ${parent.icon}`
        if (/(fa)/g.test(icon)) icon = `fa ${parent.icon}`
      }
    }
  }

  return {
    ...category,
    id,
    name,
    color,
    icon,
    parentId,
    description
  }
}
