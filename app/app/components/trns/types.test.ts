import { describe, expect, it } from 'vitest'

import type { TrnItem } from '~/components/trns/types'

import { trnWithoutWallet } from '~/components/trns/types'

const base = { createdAt: 1, date: 0, updatedAt: 1 }
const transfer: TrnItem = { ...base, fromAmount: 100, fromWalletId: 'a', toAmount: 200, toWalletId: 'b', type: 'transfer' }

describe('trnWithoutWallet', () => {
  it('drops the deleted wallet side of a two-sided transfer', () => {
    expect(trnWithoutWallet(transfer, 'a')).toEqual({ ...base, toAmount: 200, toWalletId: 'b', type: 'transfer' })
    expect(trnWithoutWallet(transfer, 'b')).toEqual({ ...base, fromAmount: 100, fromWalletId: 'a', type: 'transfer' })
  })

  it('lets every other row go with the wallet', () => {
    expect(trnWithoutWallet({ ...base, toAmount: 200, toWalletId: 'b', type: 'transfer' }, 'b')).toBeNull()
    expect(trnWithoutWallet({ ...base, categoryId: 'c', fromAmount: 100, fromWalletId: 'a', type: 'expense' }, 'a')).toBeNull()
  })
})
