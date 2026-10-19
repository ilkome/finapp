import { parseAmountInput } from '~~/utils/money/parseInput'

import type { BankReport } from '~/components/bankReports/types'
import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletType } from '~/components/wallets/types'

import { amountToMinor, minorToAmount } from '~/components/amount/utils'

export type BankReportFields = Omit<BankReport, 'createdAt' | 'updatedAt'>
export type BankReportFieldKey = keyof BankReportFields

type Field = { key: BankReportFieldKey, kind: 'amount' | 'day' }

/** Amounts are typed decimals, days are civil days or null. */
export type BankReportDraft = Record<BankReportFieldKey, string | number | null>

export const bankReportFieldGroups: { fields: Field[], id: string, walletType?: WalletType }[] = [
  {
    fields: [{ key: 'balanceAmount', kind: 'amount' }, { key: 'balanceDate', kind: 'day' }],
    id: 'balance',
  },
  {
    fields: [
      { key: 'statementDate', kind: 'day' },
      { key: 'minPaymentPeriodStartDate', kind: 'day' },
      { key: 'graceDebtAmount', kind: 'amount' },
      { key: 'graceEndDate', kind: 'day' },
      { key: 'minPaymentAmount', kind: 'amount' },
      { key: 'minPaymentDueDate', kind: 'day' },
    ],
    id: 'card',
    walletType: 'credit_card',
  },
  {
    fields: [
      { key: 'debtAmount', kind: 'amount' },
      { key: 'debtReportDate', kind: 'day' },
      { key: 'nextPrincipalAmount', kind: 'amount' },
      { key: 'nextInterestAmount', kind: 'amount' },
      { key: 'nextPaymentDate', kind: 'day' },
    ],
    id: 'loan',
    walletType: 'loan',
  },
]

const allFields = bankReportFieldGroups.flatMap(group => group.fields)

export function reportToDraft(report: BankReportFields, currencyCode: CurrencyCode): BankReportDraft {
  return Object.fromEntries(allFields.map(({ key, kind }) => {
    const value = report[key]
    if (kind === 'day')
      return [key, value ?? null]
    return [key, value === undefined ? '' : String(minorToAmount(value, currencyCode))]
  })) as BankReportDraft
}

/** A blank or unparsable amount drops the field; the schema then judges what is left. */
export function draftToReport(draft: BankReportDraft, currencyCode: CurrencyCode): BankReportFields {
  const report: BankReportFields = {}
  for (const { key, kind } of allFields) {
    const value = draft[key]
    if (kind === 'day') {
      if (typeof value === 'number')
        report[key] = value
      continue
    }
    const amount = parseAmountInput(String(value ?? ''))
    if (amount !== undefined)
      report[key] = amountToMinor(amount, currencyCode)
  }
  return report
}

/** Only the fields a wallet of this type can carry: card and loan figures are client-side rules per wallet type. */
export function pickWalletFields(report: BankReportFields, walletType: WalletType): BankReportFields {
  const keys = new Set(bankReportFieldGroups
    .filter(group => group.walletType === undefined || group.walletType === walletType)
    .flatMap(group => group.fields.map(field => field.key)))
  return Object.fromEntries(Object.entries(report).filter(([key]) => keys.has(key as BankReportFieldKey))) as BankReportFields
}

export function isEmptyReport(report: BankReportFields): boolean {
  return Object.values(report).every(value => value === undefined)
}

export type BankReportFieldError = 'negative' | 'required'

/** What the schema would reject, per field, so the form can point at it; balance amount and day go together. */
export function reportErrors(report: BankReportFields): Partial<Record<BankReportFieldKey, BankReportFieldError>> {
  const errors: Partial<Record<BankReportFieldKey, BankReportFieldError>> = {}
  for (const { key, kind } of allFields) {
    const value = report[key]
    if (kind === 'amount' && key !== 'balanceAmount' && value !== undefined && value < 0)
      errors[key] = 'negative'
  }
  if (report.balanceAmount !== undefined && report.balanceDate === undefined)
    errors.balanceDate = 'required'
  if (report.balanceAmount === undefined && report.balanceDate !== undefined)
    errors.balanceAmount = 'required'
  return errors
}
