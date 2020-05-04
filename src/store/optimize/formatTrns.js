import moment from 'moment'
import { formatTrnForDb } from '@/store/modules/trns/utils'

// Create array with all trns
// by combined trns with same day, account, category in one
const combineTrnWithSameDayAndCategory = (trns) => {
  // create object with trns in same day, account, category
  const groupedTrnsBySameDay = {}
  for (const trn of trns) {
    const { date, categoryId, walletId, description, type } = trn
    const key = `${moment(date).format('Y.M.D')}__${categoryId}__${walletId}__${description}__${type}`
    if (groupedTrnsBySameDay[key]) {
      groupedTrnsBySameDay[key] = [...groupedTrnsBySameDay[key], trn]
    } else {
      groupedTrnsBySameDay[key] = [trn]
    }
  }

  // combine trns to array
  const combinedTrns = []
  for (const key in groupedTrnsBySameDay) {
    const trnsInDay = groupedTrnsBySameDay[key]
    const incomes = trnsInDay
      .filter(t => t.type === 1)
      .reduce((sum, current) => sum + current.amount, 0)
    const expenses = trnsInDay
      .filter(t => t.type === 0)
      .reduce((sum, current) => sum + current.amount, 0)
    const sum = incomes - expenses
    const formatedTrn = {
      ...trnsInDay[0],
      type: sum > 0 ? 1 : 0,
      amount: Math.abs(sum)
    }
    combinedTrns.push(formatedTrn)
  }
  console.log('Before:', trns.length, trns.reduce((sum, current) => sum + current.amount, 0))
  console.log('After:', combinedTrns.length, combinedTrns.reduce((sum, current) => sum + current.amount, 0))
  console.log('Profit?', trns.length - combinedTrns.length)
  return combinedTrns
}

// Get object of trns and format it to array
const formatTrns = (trnsObject) => {
  const formatedTrns = []
  for (const key in trnsObject) {
    formatedTrns.push(formatTrnForDb(trnsObject[key]))
  }
  return formatedTrns
}

export default (trnsObject) => {
  if (trnsObject) {
    return combineTrnWithSameDayAndCategory(formatTrns(trnsObject))
  } else {
    console.error('No trns object was passed')
  }
}
