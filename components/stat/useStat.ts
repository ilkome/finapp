const moneyTypes = [{
  id: 'expense',
  type: 0,
}, {
  id: 'income',
  type: 1,
}]

export default function useStat() {
  return {
    moneyTypes,
  }
}
