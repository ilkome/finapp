import moment from 'moment'
import { uuid } from '@/store/utils'

export const formatTrnForDb = values => ({
  id: values.id ? values.id : `${moment(values.date).format('YY-MM-DD[_]H:mm:ss')}__${uuid()}`,
  accountId: values.accountId,
  amount: Math.abs(values.amount),
  categoryId: values.categoryId,
  currency: values.currency,
  date: values.date,
  description: values.description,
  type: values.type
})

/**
 * Format trn for Store
 * @param {object} trn - Trn for format.
 * @param {options} object - Options.
 * @param {options.accounts} Array - List of accounts.
 * @param {options.categories} Array - List of categories.
 * @param {options.rates} Array - List of rates.
 * @return {object} Formated trn.
 */
export const formatTrnForStore = (trn, options) => {
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
      console.error('No currency found', trn, options.rates, currency)
    }
  }

  // Category
  const categoryId = trn.categoryId
  const category = options.categories.find(cat => cat.id === categoryId)
  let categoryRoot = 0
  let categoryName
  let categoryColor
  let categoryIcon

  if (category) {
    categoryColor = category.color
    categoryIcon = category.icon

    // Find root category
    if (category.parentId !== 0) {
      categoryRoot = options.categories.find(cat => cat.id === category.parentId)
    } else {
      categoryRoot = category
    }

    if (!categoryColor) {
      if (category.parentId !== 0) {
        const parent = options.categories.find(cat => cat.id === category.parentId)
        if (parent && parent.color) {
          categoryColor = parent.color
        }
      }
    }

    categoryName = category.name
  } else {
    console.error('Category not found. Id:', categoryId, options.categories)
    return false
  }

  const date = +trn.date
  const description = trn.description
  const id = trn.id
  const type = +trn.type

  return {
    account,
    accountId,
    accountName,
    amount,
    amountRub,
    category,
    categoryRoot,
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
