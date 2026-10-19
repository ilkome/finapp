import { todayCivilDayEpoch } from '~~/utils/date/civil'
import { generateId } from '~~/utils/generateId'

import type { CategoryId } from '~/components/categories/types'
import type { TrnFormValuesWithLoan } from '~/components/loans/types'
import type { TrnFormUi } from '~/components/trnForm/types'
import type { CalculatorKey } from '~/components/trnForm/utils/calculate'
import type { TransferSide, TrnId, TrnItem, TrnType } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { amountToMinor, minorToAmount } from '~/components/amount/utils'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { formatLoanInterest } from '~/components/loans/formatLoanInterest'
import { useLoanPaymentDraft } from '~/components/loans/useLoanPaymentDraft'
import { createExpressionString, evaluateExpression, formatInput } from '~/components/trnForm/utils/calculate'
import { formatTrn } from '~/components/trnForm/utils/formatData'
import { validate } from '~/components/trnForm/utils/validate'
import { trnWalletId } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { showErrorToast } from '~/composables/useStoreSync'

type Values = {
  categoriesIds: CategoryId[]
  trn?: TrnItem
  walletId?: WalletId
  walletsIds: WalletId[]
} & ({
  action: 'create'
} | {
  action: 'edit' | 'duplicate'
  trnId: TrnId
})

export const useTrnsFormStore = defineStore('trnForm', () => {
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()
  const walletsStore = useWalletsStore()

  const values = reactive<TrnFormValuesWithLoan>({
    amount: [0, 0, 0],
    amountRaw: ['', '', ''],
    categoryId: null,
    date: todayCivilDayEpoch(),
    description: undefined,
    fromWalletId: null,
    loanInterest: undefined,
    toWalletId: null,
    transferOutside: undefined,
    transferType: 'from',
    trnId: null,
    trnType: 'expense',
    walletId: null,
  })

  const ui = ref<TrnFormUi>({
    isShow: false,
  })

  const modal = ref({
    description: false,
  })

  function closeTrnFormModal(name: keyof typeof modal.value) {
    modal.value[name] = false
  }

  function openTrnFormModal(name: keyof typeof modal.value) {
    modal.value[name] = true
  }

  const activeAmountIdx = computed(() =>
    values.trnType !== 'transfer'
      ? 0
      : values.transferType === 'from' ? 1 : 2,
  )

  const transferToWalletId = computed<WalletId | undefined>(
    () => values.transferOutside === 'to' ? undefined : values.toWalletId ?? walletsStore.sortedIds[0],
  )

  const transferFromWalletId = computed<WalletId | undefined>(
    () => values.transferOutside === 'from' ? undefined : values.fromWalletId ?? walletsStore.sortedIds[1] ?? walletsStore.sortedIds[0],
  )

  function currencyAt(idx: number) {
    const walletId = idx === 0 ? values.walletId : idx === 1 ? transferFromWalletId.value : transferToWalletId.value
    return walletId ? walletsStore.items?.[walletId]?.currencyCode : undefined
  }

  function setAmountAt(idx: number, raw: string) {
    values.amount[idx] = amountToMinor(evaluateExpression(raw), currencyAt(idx))
    values.amountRaw[idx] = formatInput(raw)
  }

  function syncAmountRawAt(idx: number) {
    values.amountRaw[idx] = formatInput(minorToAmount(values.amount[idx] ?? 0, currencyAt(idx)))
  }

  // A wallet picked after typing may have another scale: the typed text is the truth.
  function refreshAmounts() {
    values.amountRaw.forEach((raw, idx) => {
      values.amount[idx] = amountToMinor(evaluateExpression(raw), currencyAt(idx))
    })
  }

  const isSameCurrencyTransfer = computed(() => {
    const from = currencyAt(1)
    return !!from && from === currencyAt(2)
  })

  function onChangeAmount(amountRaw: string) {
    setAmountAt(activeAmountIdx.value, amountRaw)
  }

  function onChangeTransferAmountSynced(amountRaw: string) {
    setAmountAt(1, amountRaw)
    setAmountAt(2, amountRaw)
  }

  function onClickCalculator(key: CalculatorKey) {
    const value = createExpressionString(key, values.amountRaw[activeAmountIdx.value] ?? '')
    if (values.trnType === 'transfer' && isSameCurrencyTransfer.value)
      onChangeTransferAmountSynced(value)
    else
      onChangeAmount(value)
  }

  function onTransferWalletSelected(side: TransferSide, id: WalletId) {
    const wasSame = isSameCurrencyTransfer.value

    if (side === 'from')
      values.fromWalletId = id
    else
      values.toWalletId = id
    if (values.transferOutside === side)
      values.transferOutside = undefined

    if (wasSame && !isSameCurrencyTransfer.value) {
      values.amount[2] = 0
      values.amountRaw[2] = ''
    }

    if (!wasSame && isSameCurrencyTransfer.value) {
      const pickIdx = values.amount[1] !== 0
        ? 1
        : values.amount[2] !== 0
          ? 2
          : values.transferType === 'to' ? 2 : 1
      values.amount[1] = values.amount[pickIdx]
      values.amountRaw[1] = values.amountRaw[pickIdx]
      values.amount[2] = values.amount[1]
      values.amountRaw[2] = values.amountRaw[1]
      values.transferType = 'from'
    }
  }

  /** Marks one side of a transfer as outside the app; picking a wallet for that side brings it back. */
  function onTransferOutside(side: TransferSide | undefined) {
    values.transferOutside = side
    if (side)
      values.transferType = side === 'from' ? 'to' : 'from'
  }

  function switchTransferWallets() {
    const toId = values.toWalletId
    const fromId = values.fromWalletId

    values.toWalletId = fromId
    values.fromWalletId = toId
    if (values.transferOutside)
      values.transferOutside = values.transferOutside === 'from' ? 'to' : 'from'

    if (isSameCurrencyTransfer.value) {
      values.amount[2] = values.amount[1]
      values.amountRaw[2] = values.amountRaw[1]
    }
    else {
      const amt1 = values.amount[1]
      const raw1 = values.amountRaw[1]
      const amt2 = values.amount[2]
      const raw2 = values.amountRaw[2]

      values.amount[1] = amt2
      values.amountRaw[1] = raw2
      values.amount[2] = amt1
      values.amountRaw[2] = raw1
    }
  }

  function copyTransferAmount() {
    values.amount[2] = values.amount[1]
    values.amountRaw[2] = values.amountRaw[1]
  }

  function shouldShowSum() {
    const isExpression = (idx: number) => formatInput(evaluateExpression(values.amountRaw[idx] ?? '')) !== values.amountRaw[idx]
    if (values.trnType === 'transfer')
      return (values.amount[1] !== 0 && isExpression(1)) || (values.amount[2] !== 0 && isExpression(2))

    return (values.amount[0] !== 0 || values.amountRaw[0] !== '') && isExpression(0)
  }
  function onChangeTrnType(trnType: TrnType) {
    values.trnType = trnType
  }

  function onChangeTransferType(transferType: TransferSide) {
    values.transferType = transferType
  }

  function onClear() {
    values.amount = [0, 0, 0]
    values.amountRaw = ['', '', '']
    values.description = undefined
    values.loanInterest = undefined
    values.trnId = null
  }

  function $reset() {
    values.amount = [0, 0, 0]
    values.amountRaw = ['', '', '']
    values.categoryId = null
    values.date = todayCivilDayEpoch()
    values.description = undefined
    values.fromWalletId = null
    values.toWalletId = null
    values.loanInterest = undefined
    values.transferOutside = undefined
    values.transferType = 'from'
    values.trnId = null
    values.trnType = 'expense'
    values.walletId = null

    ui.value = {
      isShow: false,
    }
    modal.value = {
      description: false,
    }
  }

  function onClose() {
    if (values.trnId)
      onClear()

    ui.value.isShow = false
  }

  function setValues(props: Values) {
    values.trnId = null
    // A draft left by an unsaved "Pay" would otherwise ride along with the next save.
    values.loanInterest = undefined
    values.transferOutside = undefined

    if (props.action === 'create') {
      values.trnType = 'expense'
      if (!values.walletId || !props.walletsIds.includes(values.walletId))
        values.walletId = props.walletId ?? (props.trn ? trnWalletId(props.trn) : undefined) ?? props.walletsIds[0] ?? null
      if (!values.categoryId || !props.categoriesIds.includes(values.categoryId as CategoryId))
        values.categoryId = props.trn?.categoryId ?? props.categoriesIds[0] ?? null

      values.toWalletId = props.walletsIds[0] ?? null
      values.fromWalletId = props.walletsIds[1] ?? props.walletsIds[0] ?? null
    }

    if (props.action === 'edit')
      values.trnId = props.trnId

    if ((props.action === 'edit' || props.action === 'duplicate') && props.trn) {
      const trn = props.trn
      if (trn.type === 'transfer') {
        values.amount = [0, trn.fromAmount ?? 0, trn.toAmount ?? 0]
        values.fromWalletId = trn.fromWalletId ?? null
        values.toWalletId = trn.toWalletId ?? null
        values.transferOutside = !trn.fromWalletId ? 'from' : !trn.toWalletId ? 'to' : undefined
      }
      else {
        values.amount = [trn.fromAmount ?? trn.toAmount ?? 0, 0, 0]
        values.walletId = trnWalletId(trn) ?? null
        if (trn.categoryId)
          values.categoryId = trn.categoryId
      }

      values.amountRaw = values.amount.map((minor, idx) => minor ? formatInput(minorToAmount(minor, currencyAt(idx))) : '') as TrnFormValuesWithLoan['amountRaw']
      values.trnType = trn.type
      values.description = trn.description
      values.date = trn.date

      // Transfer now same-currency but stored amounts differ: normalize to expense amount
      if (props.trn.type === 'transfer' && isSameCurrencyTransfer.value
        && values.amount[1] !== values.amount[2]) {
        values.amount[2] = values.amount[1]
        values.amountRaw[2] = values.amountRaw[1]
      }
    }
  }

  async function onSubmit() {
    if (values.trnType !== 'transfer') {
      if (!values.walletId || !walletsStore.items?.[values.walletId]) {
        showErrorToast('trnForm.errors.selectWallet')
        return
      }
      if (!values.categoryId || !categoriesStore.items?.[values.categoryId]) {
        showErrorToast('trnForm.errors.selectCategory')
        return
      }
    }

    if (values.trnType === 'transfer') {
      values.fromWalletId = transferFromWalletId.value ?? null
      values.toWalletId = transferToWalletId.value ?? null
    }
    refreshAmounts()
    const data = formatTrn(values)

    if (!data) {
      showErrorToast('base.noData')
      return
    }

    const error = validate(data)
    if (error) {
      showErrorToast(error)
      return
    }

    const loanInterestTrn = values.trnType === 'transfer'
      ? formatLoanInterest(values)
      : undefined

    return {
      extra: loanInterestTrn ? { id: generateId(), values: loanInterestTrn } : undefined,
      id: values.trnId ?? generateId(),
      values: data,
    }
  }

  function onChangeCountSum() {
    if (values.trnType === 'transfer') {
      syncAmountRawAt(1)
      syncAmountRawAt(2)
      return
    }

    syncAmountRawAt(0)
  }

  function openFormForEdit(trnId: TrnId) {
    const trn = trnsStore.items?.[trnId]
    if (!trn)
      return

    setValues({
      action: 'edit',
      categoriesIds: categoriesStore.categoriesIdsForTrnValues,
      trn,
      trnId,
      walletsIds: walletsStore.sortedIds,
    })
    ui.value.isShow = true
  }

  function openFormForCreate() {
    setValues({
      action: 'create',
      categoriesIds: categoriesStore.categoriesIdsForTrnValues,
      trn: trnsStore.lastCreatedTrnItem ?? undefined,
      walletId: walletsStore.sortedIds[0],
      walletsIds: walletsStore.sortedIds,
    })
    ui.value.isShow = true
  }

  // Shared by the round-categories quick-add row and the categories long-press gesture: open a
  // fresh create form pre-filled with a single category and no amount yet.
  function openFormForCategory(categoryId: CategoryId, date: number = todayCivilDayEpoch()) {
    if (!categoriesStore.isTransactible(categoryId))
      return

    openFormForCreate()
    values.amount = [0, 0, 0]
    values.amountRaw = ['', '', '']
    values.categoryId = categoryId
    values.date = date
  }

  const loanDraft = useLoanPaymentDraft(values, { openFormForCreate })

  function openFormForDuplicate(trnId: TrnId) {
    const trn = trnsStore.items?.[trnId] as TrnItem

    if (!trn)
      return

    setValues({
      action: 'duplicate',
      categoriesIds: categoriesStore.categoriesIdsForTrnValues,
      trn,
      trnId,
      walletsIds: walletsStore.sortedIds,
    })

    ui.value.isShow = true
  }

  return {
    ...loanDraft,
    $reset,
    activeAmountIdx,
    closeTrnFormModal,
    copyTransferAmount,
    isSameCurrencyTransfer,
    modal,
    onChangeAmount,
    onChangeCountSum,
    onChangeTransferAmountSynced,
    onChangeTransferType,
    onChangeTrnType,
    onClear,
    onClickCalculator,
    onClose,
    onSubmit,
    onTransferOutside,
    onTransferWalletSelected,
    openFormForCategory,
    openFormForCreate,
    openFormForDuplicate,
    openFormForEdit,
    openTrnFormModal,
    shouldShowSum,
    switchTransferWallets,
    transferFromWalletId,
    transferToWalletId,
    ui,
    values,
  }
})
