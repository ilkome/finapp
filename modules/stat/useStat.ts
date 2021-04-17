const moneyTypes = [{
  id: 'expenses',
  type: 0
}, {
  id: 'incomes',
  type: 1
}]

export default function useStat () {
  return {
    moneyTypes
  }
}
