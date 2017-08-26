/**
 * Format trn.
 * @param {object} trn - Trn for format.
 * @param {options} object - Options.
 * @param {options.accounts} Array - List of accounts.
 * @param {options.categories} Array - List of categories.
 * @param {options.rates} Array - List of rates.
 * @return {object} Formated trn.
 */
export default function formatTrn(trn, options) {
  if (options) {
    if (options.accounts.length < 0) {
      console.error('formatTrn: must to have accounts')
      return false
    }
    if (options.categories.length < 0) {
      console.error('formatTrn: must to have categories')
      return false
    }
    if (options.rates.length < 0) {
      console.error('formatTrn: must to have rates')
      return false
    }
  } else {
    console.error('formatTrn: must to have options')
    return false
  }

  // Account
  let accountId = trn.accountId
  const account = options.accounts.find(a => a.id === accountId)
  let accountName
  if (account) {
    accountName = account.name
  } else {
    accountId = 'not found'
    accountName = 'not found'
  }

  // Amount
  const amount = Math.abs(trn.amount)
  let amountRub
  const currency = trn.currency
  if (currency === 'RUB') {
    amountRub = Math.abs(trn.amount)
  } else {
    if (options.rates[currency]) {
      amountRub = Math.floor(Math.abs(trn.amount / options.rates[currency]))
    } else {
      console.error('No currency found', options.rates, currency)
      return false
    }
  }

  // Category
  const categoryId = trn.categoryId
  const category = options.categories.find(cat => cat.id === categoryId)
  let categoryName
  let categoryColor = category.color
  const categoryIcon = category.icon
  if (category) {
    if (!categoryColor) {
      if (category.parentId > 0) {
        const parent = options.categories.find(cat => cat.id === category.parentId)
        if (parent && parent.color) {
          categoryColor = parent.color
        }
      }
    }

    categoryName = category.name
  } else {
    console.error('Category not found. Id:', categoryId)
    return false
  }

  const date = +trn.date
  const description = trn.description
  const id = trn.id ? trn.id : trn.key
  const type = +trn.type

  return {
    accountId,
    accountName,
    amount,
    amountRub,
    categoryId,
    categoryColor,
    categoryIcon,
    categoryName,
    date,
    description,
    currency,
    id,
    type
  }
}
