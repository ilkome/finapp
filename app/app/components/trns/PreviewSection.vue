<script setup lang="ts">
import type { Rates } from '~/components/currencies/types'
import type { TrnPreviewLoan } from '~/components/trns/PreviewView.vue'
import type { TrnId, TrnItemFull } from '~/components/trns/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { getTransferRate, getTrnConversions } from '~/components/trns/preview'
import { TrnType } from '~/components/trns/types'
import { useTrnActions } from '~/components/trns/useTrnActions'
import { isCreditProduct } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useFeature } from '~/composables/useFeatures'

const props = defineProps<{
  trnId: TrnId
  trnItem: TrnItemFull
}>()

const emit = defineEmits<{
  closed: []
  /** An action is about to leave the list: a surrounding modal closes too. */
  leave: []
}>()

const { locale, t } = useI18n()
const isLaptop = useIsLaptop()
const currenciesStore = useCurrenciesStore()
const walletsStore = useWalletsStore()
const isLoans = useFeature('loans')
const actions = useTrnActions()
// vueuse types a binding as a prop option, so a function type must stay `any`.
const [DefineBody, ReuseBody] = createReusableTemplate<{ close: any }>()

const ratesOnDate = ref<Rates | null>(null)
watch(() => props.trnItem.date, async (date) => {
  ratesOnDate.value = await currenciesStore.getRatesOn(date).catch(() => null)
}, { immediate: true })

const amount = computed(() => props.trnItem.type === TrnType.Transfer ? props.trnItem.expenseAmount : props.trnItem.amount)
const currency = computed(() => props.trnItem.type === TrnType.Transfer ? props.trnItem.expenseWallet.currency : props.trnItem.wallet.currency)

const conversions = computed(() => getTrnConversions({
  amount: amount.value,
  base: currenciesStore.base,
  currency: currency.value,
  rates: currenciesStore.rates,
  ratesOnDate: ratesOnDate.value,
  walletCurrencies: walletsStore.currenciesUsed,
}))

const transferRate = computed(() => props.trnItem.type === TrnType.Transfer
  ? getTransferRate({
      expenseAmount: props.trnItem.expenseAmount,
      expenseCurrency: props.trnItem.expenseWallet.currency,
      incomeAmount: props.trnItem.incomeAmount,
      incomeCurrency: props.trnItem.incomeWallet.currency,
      rates: currenciesStore.rates,
      ratesOnDate: ratesOnDate.value,
    })
  : null)

const loan = computed<TrnPreviewLoan | undefined>(() => {
  if (!isLoans.value)
    return undefined
  const trn = props.trnItem
  if (trn.type === TrnType.Transfer) {
    if (isCreditProduct(trn.incomeWallet.type))
      return { kind: 'payment', name: trn.incomeWallet.name, walletId: trn.incomeWalletId }
    if (isCreditProduct(trn.expenseWallet.type))
      return { kind: 'credit', name: trn.expenseWallet.name, walletId: trn.expenseWalletId }
    return undefined
  }
  if (!isCreditProduct(trn.wallet.type))
    return undefined
  const kind = trn.categoryId === 'loanInterest' ? 'interest' : trn.categoryId === 'loanFine' ? 'fine' : 'credit'
  return { kind, name: trn.wallet.name, walletId: trn.walletId }
})

// The trn date is a civil day (UTC midnight); entry and change are instants shown in local time.
const dayFormat = computed(() => new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeZone: 'UTC' }))
const instantFormat = computed(() => new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' }))

const viewProps = computed(() => ({
  canFilterCategory: actions.canFilterCategory(props.trnItem),
  canFilterWallet: !actions.isWalletPage.value,
  conversions: conversions.value,
  dateLabel: dayFormat.value.format(props.trnItem.date),
  enteredAtLabel: props.trnItem.enteredAt ? instantFormat.value.format(props.trnItem.enteredAt) : undefined,
  hasRatesOnDate: !!ratesOnDate.value,
  loan: loan.value,
  transferRate: transferRate.value,
  trnItem: props.trnItem,
  updatedAtLabel: instantFormat.value.format(props.trnItem.updatedAt),
}))

// Navigation and the form wait for the preview's exit animation.
let pending: (() => void) | null = null
function onClosed() {
  const fn = pending
  pending = null
  emit('closed')
  fn?.()
}

function leaveWith(close: () => void, fn: () => void) {
  pending = async () => {
    emit('leave')
    await nextTick()
    fn()
  }
  close()
}

async function onDelete(close: () => void) {
  if (await actions.deleteWithConfirm(props.trnId))
    close()
}
</script>

<template>
  <DefineBody v-slot="{ close }">
    <TrnsPreviewView
      v-bind="viewProps"
      @edit="leaveWith(close, () => actions.edit(props.trnId))"
      @duplicate="leaveWith(close, () => actions.duplicate(props.trnId))"
      @delete="onDelete(close)"
      @filterCategory="leaveWith(close, () => actions.filterByCategory(props.trnItem.categoryId))"
      @filterWallet="walletId => leaveWith(close, () => actions.filterByWallet(walletId))"
      @filterDate="leaveWith(close, () => actions.filterByDate(props.trnItem.date))"
      @openWallet="walletId => leaveWith(close, () => actions.openWallet(walletId))"
    />
  </DefineBody>

  <UiModalWrap
    v-if="isLaptop"
    defaultOpen
    :title="t('trns.preview.title')"
    @after:leave="onClosed"
  >
    <template #default="{ close }">
      <ReuseBody :close />
    </template>
  </UiModalWrap>

  <Drawer
    v-else
    :title="t('trns.preview.title')"
    @closed="onClosed"
  >
    <template #default="{ close }">
      <div class="drawer-body">
        <ReuseBody :close />
      </div>
    </template>
  </Drawer>
</template>
