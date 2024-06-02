import type { WalletForm } from '~/components/wallets/types'
import { allColors } from '~/assets/js/colors'
import { random } from '~/assets/js/emo'

export function getPreparedFormData(values?: any): WalletForm {
  return {
    color: values?.color ?? random(random(allColors)),
    countTotal: values?.countTotal ?? true,
    creditLimit: values?.creditLimit ?? 0,
    currency: values?.currency ?? 'USD',
    description: values?.description ?? null,
    isCredit: values?.isCredit ?? false,
    name: values?.name ?? '',
    order: values?.order ?? 1,
  }
}
