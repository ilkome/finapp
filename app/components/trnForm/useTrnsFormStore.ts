import { generateId } from '~~/utils/generateId'

import type { CategoryId } from '~/components/categories/types'
import type { TrnFormUi } from '~/components/trnForm/types'
import type { CalculatorKey } from '~/components/trnForm/utils/calculate'
import type { TransferSide, TrnFormValues, TrnId, TrnItem } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { createExpressionString, evaluateExpression, formatInput } from '~/components/trnForm/utils/calculate'
import { formatTransaction, formatTransfer } from '~/components/trnForm/utils/formatData'
import { validate } from '~/components/trnForm/utils/validate'
import { TrnType } from '~/components/trns/types'
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

  const values = reactive<TrnFormValues>({
    amount: [0, 0, 0],
    amountRaw: ['', '', ''],
    categoryId: null,
    date: Date.now(),
    desc: undefined,
    expenseWalletId: null,
    incomeWalletId: null,
    transferType: 'expense',
    trnId: null,
    trnType: TrnType.Expense,
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
    values.trnType !== TrnType.Transfer
      ? 0
      : values.transferType === 'expense' ? 1 : 2,
  )

  function setAmountAt(idx: number, raw: string) {
    values.amount[idx] = evaluateExpression(raw)
    values.amountRaw[idx] = formatInput(raw)
  }

  function syncAmountRawAt(idx: number) {
    values.amountRaw[idx] = formatInput(values.amount[idx] ?? 0)
  }

  const transferIncomeWalletId = computed<WalletId | undefined>(
    () => values.incomeWalletId ?? walletsStore.sortedIds[0],
  )

  const transferExpenseWalletId = computed<WalletId | undefined>(
    () => values.expenseWalletId ?? walletsStore.sortedIds[1] ?? walletsStore.sortedIds[0],
  )

  const isSameCurrencyTransfer = computed(() => {
    if (!transferExpenseWalletId.value || !transferIncomeWalletId.value)
      return false

    const expenseWallet = walletsStore.items?.[transferExpenseWalletId.value]
    const incomeWallet = walletsStore.items?.[transferIncomeWalletId.value]

    if (!expenseWallet || !incomeWallet)
      return false

    return expenseWallet.currency === incomeWallet.currency
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
    if (isSameCurrencyTransfer.value)
      onChangeTransferAmountSynced(value)
    else
      onChangeAmount(value)
  }

  function onTransferWalletSelected(side: 'expense' | 'income', id: WalletId) {
    const wasSame = isSameCurrencyTransfer.value

    if (side === 'expense')
      values.expenseWalletId = id
    else
      values.incomeWalletId = id

    // same → different: reset income amount
    if (wasSame && !isSameCurrencyTransfer.value) {
      values.amount[2] = 0
      values.amountRaw[2] = ''
    }

    // different → same: copy expense amount to income, reset transferType
    if (!wasSame && isSameCurrencyTransfer.value) {
      values.amount[2] = values.amount[1]
      values.amountRaw[2] = values.amountRaw[1]
      values.transferType = 'expense'
    }
  }

  function switchTransferWallets() {
    const incomeId = values.incomeWalletId
    const expenseId = values.expenseWalletId

    values.incomeWalletId = expenseId
    values.expenseWalletId = incomeId

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
    if (values.trnType === TrnType.Transfer) {
      const expense = values.amount[1] !== 0
        && formatInput(values.amount[1]) !== values.amountRaw[1]
      const income = values.amount[2] !== 0
        && formatInput(values.amount[2]) !== values.amountRaw[2]

      return expense || income
    }

    return (values.amount[0] !== 0 || values.amountRaw[0] !== '')
      && formatInput(values.amount[0]) !== values.amountRaw[0]
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
    values.desc = undefined
    values.trnId = null
  }

  function $reset() {
    values.amount = [0, 0, 0]
    values.amountRaw = ['', '', '']
    values.categoryId = null
    values.date = Date.now()
    values.desc = undefined
    values.expenseWalletId = null
    values.incomeWalletId = null
    values.transferType = 'expense'
    values.trnId = null
    values.trnType = TrnType.Expense
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

    if (props.action === 'create') {
      values.trnType = TrnType.Expense
      if (!values.walletId || !props.walletsIds.includes(values.walletId))
        values.walletId = props.walletId ?? (props.trn && 'walletId' in props.trn ? props.trn.walletId : undefined) ?? props.walletsIds[0] ?? null
      if (!values.categoryId || !props.categoriesIds.includes(values.categoryId as CategoryId))
        values.categoryId = props.trn?.categoryId ?? props.categoriesIds[0] ?? null

      values.incomeWalletId = props.walletsIds[0] ?? null
      values.expenseWalletId = props.walletsIds[1] ?? props.walletsIds[0] ?? null
    }

    if (props.action === 'edit')
      values.trnId = props.trnId

    if ((props.action === 'edit' || props.action === 'duplicate') && props.trn) {
      if (props.trn.type !== TrnType.Transfer) {
        values.amount = [props.trn.amount, 0, 0]
        values.categoryId = props.trn.categoryId
        values.walletId = props.trn.walletId
      }

      if (props.trn.type === TrnType.Transfer) {
        values.amount = [0, props.trn.expenseAmount, props.trn.incomeAmount]
        values.expenseWalletId = props.trn.expenseWalletId
        values.incomeWalletId = props.trn.incomeWalletId
        values.categoryId = 'transfer'
      }

      values.amountRaw = values.amount.map(i => formatInput(i)) as TrnFormValues['amountRaw']
      values.trnType = props.trn.type
      values.desc = props.trn.desc
      values.date = props.trn.date
    }
  }

  async function onSubmit() {
    if (values.trnType !== TrnType.Transfer) {
      if (!values.walletId || !walletsStore.items?.[values.walletId]) {
        showErrorToast('trnForm.errors.selectWallet')
        return
      }
      if (!values.categoryId || !categoriesStore.items?.[values.categoryId]) {
        showErrorToast('trnForm.errors.selectCategory')
        return
      }
    }

    const data = values.trnType !== TrnType.Transfer
      ? formatTransaction(values)
      : formatTransfer(values)

    if (!data) {
      showErrorToast('base.noData')
      return
    }

    const error = validate(data)
    if (error) {
      showErrorToast(error)
      return
    }

    return {
      id: values.trnId ?? generateId(),
      values: data,
    }
  }

  function onChangeCountSum() {
    if (values.trnType === TrnType.Transfer) {
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
    onTransferWalletSelected,
    openFormForCreate,
    openFormForDuplicate,
    openFormForEdit,
    openTrnFormModal,
    shouldShowSum,
    switchTransferWallets,
    transferExpenseWalletId,
    transferIncomeWalletId,
    ui,
    values,
  }
})
