import type { WalletForm } from '~/components/wallets/types'
import { allColors } from '~/assets/js/colors'
import { random } from '~/assets/js/emo'

export function getPreparedFormData(values?: DeepPartial<WalletForm>): WalletForm {
  return {
    archived: values?.archived ?? false,
    color: values?.color ?? random(random(allColors)),
    creditLimit: values?.creditLimit ?? null,
    currency: values?.currency ?? 'USD',
    description: values?.description ?? null,
    isCash: values?.isCash ?? false,
    isCashless: values?.isCashless ?? false,
    isCredit: values?.isCredit ?? false,
    isDebt: values?.isDebt ?? false,
    isDeposit: values?.isDeposit ?? false,
    isIncludeTotal: values?.isIncludeTotal ?? false,
    name: values?.name ?? '',
    order: values?.order ?? 1,
    withdrawal: values?.withdrawal ?? false,
  }
}
