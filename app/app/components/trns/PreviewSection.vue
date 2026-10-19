<script setup lang="ts">
import type { Rates } from '~/components/currencies/types'
import type { TrnPreviewLoan } from '~/components/trns/PreviewView.vue'
import type { TrnId, TrnItemFull } from '~/components/trns/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { getTransferRate, getTrnConversions } from '~/components/trns/preview'
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

const amount = computed(() => props.trnItem.fromAmount ?? props.trnItem.toAmount ?? 0)
const currency = computed(() => (props.trnItem.fromWallet ?? props.trnItem.toWallet)?.currencyCode)

const conversions = computed(() => currency.value
  ? getTrnConversions({
      amount: amount.value,
      base: currenciesStore.base,
      currency: currency.value,
      rates: currenciesStore.rates,
      ratesOnDate: ratesOnDate.value,
      walletCurrencies: walletsStore.currenciesUsed,
    })
  : [])

const transferRate = computed(() => {
  const { fromAmount, fromWallet, toAmount, toWallet, type } = props.trnItem
  return type === 'transfer' && fromWallet && toWallet
    ? getTransferRate({
        fromAmount: fromAmount ?? 0,
        fromCurrency: fromWallet.currencyCode,
        rates: currenciesStore.rates,
        ratesOnDate: ratesOnDate.value,
        toAmount: toAmount ?? 0,
        toCurrency: toWallet.currencyCode,
      })
    : null
})

const loan = computed<TrnPreviewLoan | undefined>(() => {
  if (!isLoans.value)
    return undefined
  const trn = props.trnItem
  if (trn.type === 'transfer') {
    if (trn.toWallet && trn.toWalletId && isCreditProduct(trn.toWallet.type))
      return { kind: 'payment', name: trn.toWallet.name, walletId: trn.toWalletId }
    if (trn.fromWallet && trn.fromWalletId && isCreditProduct(trn.fromWallet.type))
      return { kind: 'credit', name: trn.fromWallet.name, walletId: trn.fromWalletId }
    return undefined
  }
  const wallet = trn.fromWallet ?? trn.toWallet
  const walletId = trn.fromWalletId ?? trn.toWalletId
  if (!wallet || !walletId || !isCreditProduct(wallet.type))
    return undefined
  const kind = trn.categoryId === 'loan_interest' ? 'interest' : trn.categoryId === 'loan_fine' ? 'fine' : 'credit'
  return { kind, name: wallet.name, walletId }
})

// The trn date is a civil day (UTC midnight); entry and change are instants shown in local time.
const dayFormat = computed(() => new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeZone: 'UTC' }))
const instantFormat = computed(() => new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' }))

const viewProps = computed(() => ({
  canFilterCategory: actions.canFilterCategory(props.trnItem),
  canFilterWallet: !actions.isWalletPage.value,
  conversions: conversions.value,
  createdAtLabel: instantFormat.value.format(props.trnItem.createdAt),
  dateLabel: dayFormat.value.format(props.trnItem.date),
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
      @filterCategory="leaveWith(close, () => actions.filterByCategory(props.trnItem.categoryId!))"
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
