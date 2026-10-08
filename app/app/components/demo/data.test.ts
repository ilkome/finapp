import { addMonths } from 'date-fns'
import { describe, expect, it } from 'vitest'
import { localInstantToCivilDay } from '~~/utils/date/civil'

import { demoLoans, demoLoanStart } from '~/components/demo/data'
import { paramsOf } from '~/components/loans/engine/derive'
import { generateSchedule } from '~/components/loans/engine/schedule'
import { loanItemSchema } from '~/components/loans/types'

// Demo data is built back from the moment it is generated, so the mix must hold on any day.
describe.each(['2026-01-31T12:00:00', '2026-10-08T09:00:00', '2028-02-29T23:00:00'])('demo loans generated on %s', (now) => {
  const instant = Date.parse(now)
  const today = localInstantToCivilDay(instant)
  const isRepaid = demoLoans.map((config) => {
    if (config.payoff !== undefined)
      return true
    const start = demoLoanStart(config, instant)
    const loan = loanItemSchema.parse({ ...config, firstPaymentDate: addMonths(start, 1).getTime(), startDate: start.getTime() })
    return generateSchedule(paramsOf(loan)).at(-1)!.date <= today
  })

  it('has both repaid and still running loans', () => {
    expect(isRepaid.filter(Boolean).length).toBeGreaterThanOrEqual(2)
    expect(isRepaid.filter(repaid => !repaid).length).toBeGreaterThanOrEqual(2)
  })
})
