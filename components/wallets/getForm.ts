import type { WalletForm } from '~/components/wallets/types'
import { allColors } from '~/assets/js/colors'
import { random } from '~/assets/js/emo'

export function getPreparedFormData(values?: any): WalletForm {
  return {
    order: values?.order ?? 1,
    name: values?.name ?? '',
    isCredit: values?.isCredit ?? false,
    description: values?.description ?? null,
    currency: values?.currency ?? 'USD',
    countTotal: values?.countTotal ?? true,
    color: values?.color ?? random(allColors),
  }
}
