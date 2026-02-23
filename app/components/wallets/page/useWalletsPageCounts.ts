import type { ComputedRef } from 'vue'

import type { WalletId } from '~/components/wallets/types'

import { useAmount } from '~/components/amount/useAmount'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export function useWalletsPageCounts(
  selectedWalletsIdsWithCurrency: ComputedRef<WalletId[]>,
) {
  const walletsStore = useWalletsStore()
  const currenciesStore = useCurrenciesStore()
  const { getAmountInBaseRate } = useAmount()

  const counts = computed(() => {
    const sum = {
      archived: 0,
      available: 0,
      cash: 0,
      cashless: 0,
      credit: 0,
      creditPossible: 0,
      crypto: 0,
      debt: 0,
      deposit: 0,
      excludeInTotal: 0,
      total: 0,
      withdrawal: 0,
    }

    for (const walletId of selectedWalletsIdsWithCurrency.value) {
      const wallet = walletsStore.itemsComputed[walletId]
      if (!wallet)
        continue

      const itemValue
        = wallet.currency === currenciesStore.base
          ? (walletsStore.itemsComputed[walletId]?.amount ?? 0)
          : +getAmountInBaseRate({
              amount: walletsStore.itemsComputed[walletId]?.amount ?? 0,
              currencyCode: wallet.currency ?? 'USD',
              noFormat: true,
            })

      if (wallet.isExcludeInTotal) {
        sum.excludeInTotal += itemValue
      }
      else if (wallet.type !== 'credit') {
        sum.total += itemValue
      }

      if (wallet.type === 'cash')
        sum.cash += itemValue

      if (wallet.type === 'cashless')
        sum.cashless += itemValue
      if (wallet.type === 'crypto')
        sum.crypto += itemValue

      if (wallet.type === 'deposit')
        sum.deposit += itemValue

      if (wallet.type === 'debt')
        sum.debt += itemValue

      if (wallet.type === 'credit')
        sum.credit += itemValue

      if (wallet.type === 'credit' && wallet.creditLimit) {
        sum.creditPossible = sum.creditPossible + +getAmountInBaseRate({
          amount: wallet.creditLimit ?? 0,
          currencyCode: wallet.currency ?? 'USD',
          noFormat: true,
        })
      }

      if (wallet.isWithdrawal)
        sum.withdrawal += itemValue

      if (wallet.isArchived) {
        sum.archived += itemValue
      }
    }

    return {
      cash: {
        id: 'cash',
        isShow: Object.keys(walletsStore.itemsComputed).length > 1 && sum.cash !== 0,
        value: sum.cash,
      },
      // eslint-disable-next-line perfectionist/sort-objects
      available: {
        id: 'isAvailable',
        isShow: sum.withdrawal !== 0,
        value: sum.withdrawal - Math.abs(sum.credit),
      },

      cashless: {
        id: 'cashless',
        isShow: sum.cashless !== 0,
        value: sum.cashless,
      },

      credit: {
        id: 'credit',
        isShow: sum.credit !== 0,
        secondValue: sum.creditPossible,
        value: sum.credit,
      },

      crypto: {
        id: 'crypto',
        isShow: sum.crypto !== 0,
        value: sum.crypto,
      },

      debt: {
        id: 'debt',
        isShow: sum.debt !== 0,
        value: sum.debt,
      },

      deposit: {
        id: 'deposit',
        isShow: sum.deposit !== 0,
        value: sum.deposit,
      },

      total: {
        id: 'total',
        isShow: true,
        value: sum.total,
      },

      withdrawal: {
        id: 'isWithdrawal',
        isShow: sum.withdrawal !== 0,
        value: sum.withdrawal,
      },
      // eslint-disable-next-line perfectionist/sort-objects
      excludeInTotal: {
        id: 'isExcludeInTotal',
        isShow: sum.excludeInTotal !== 0,
        value: sum.excludeInTotal,
      },
      // eslint-disable-next-line perfectionist/sort-objects
      archived: {
        id: 'isArchived',
        isShow: selectedWalletsIdsWithCurrency.value.some(wallet => walletsStore.itemsComputed[wallet]?.isArchived),
        value: sum.archived,
      },
    }
  })

  function countWalletsSum(
    walletsIds: WalletId[],
    isConvert = true,
  ) {
    return walletsIds.reduce((acc, id) => {
      const wallet = walletsStore.itemsComputed[id]
      if (!wallet)
        return acc

      if (isConvert) {
        return (
          acc
          + +getAmountInBaseRate({
            amount: wallet.amount,
            currencyCode: wallet.currency,
            noFormat: true,
          })
        )
      }

      if (wallet.isExcludeInTotal)
        return acc
      return acc + wallet.amount
    }, 0)
  }

  return {
    counts,
    countWalletsSum,
  }
}
