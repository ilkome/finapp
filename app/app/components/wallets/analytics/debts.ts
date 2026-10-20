import type { WalletId } from '~/components/wallets/types'

/** Card utilization above this share of the limit is flagged. */
export const UTILIZATION_WARNING = 0.3

/** Debt over limit per card with a limit, and in total; a card without a limit says nothing about utilization. */
export function creditUtilization(cards: { debt: number, id: WalletId, limit?: number }[]) {
  const items = cards
    .filter((card): card is typeof card & { limit: number } => !!card.limit && card.limit > 0)
    .map(card => ({ ...card, isWarning: card.debt / card.limit > UTILIZATION_WARNING, share: card.debt / card.limit }))
  const debt = items.reduce((sum, card) => sum + card.debt, 0)
  const limit = items.reduce((sum, card) => sum + card.limit, 0)
  return { items, total: limit ? { debt, isWarning: debt / limit > UTILIZATION_WARNING, limit, share: debt / limit } : null }
}
