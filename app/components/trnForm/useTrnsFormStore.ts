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
  trn: TrnItem
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
    date: new Date().getTime(),
    desc: undefined,
    expenseWalletId: null,
    incomeWalletId: null,
    transferType: 'expense',
    trnId: null,
    trnType: 0,
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

  function onChangeAmount(amountRaw: string) {
    values.amount[activeAmountIdx.value] = evaluateExpression(amountRaw)
    values.amountRaw[activeAmountIdx.value] = formatInput(amountRaw)
  }

  function onClickCalculator(key: CalculatorKey) {
    const value = createExpressionString(key, values.amountRaw[activeAmountIdx.value] ?? '')
    onChangeAmount(value)
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
    values.date = new Date().getTime()
    values.desc = undefined
    values.expenseWalletId = null
    values.incomeWalletId = null
    values.transferType = 'expense'
    values.trnId = null
    values.trnType = 0
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
      values.trnType = 0
      if (!values.walletId || !props.walletsIds.includes(values.walletId))
        values.walletId = props.walletId ?? props.trn?.walletId ?? props.walletsIds[0]
      if (!values.categoryId || !props.categoriesIds.includes(values.categoryId as CategoryId))
        values.categoryId = props.trn?.categoryId ?? props.categoriesIds[0]

      values.incomeWalletId = props.walletsIds[0]
      values.expenseWalletId = props.walletsIds[1] ?? props.walletsIds[0]
    }

    if (props.action === 'edit')
      values.trnId = props.trnId

    if (props.action === 'edit' || props.action === 'duplicate') {
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
    // Validate wallet/category exist before formatting
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
    // Transfer
    if (values.trnType === TrnType.Transfer) {
      values.amountRaw[1] = formatInput(values.amount[1])
      values.amountRaw[2] = formatInput(values.amount[2])
      return
    }

    // Transaction
    if (values.amount[0] !== 0) {
      values.amountRaw[0] = formatInput(values.amount[0])
      return
    }

    values.amountRaw[0] = formatInput(0)
  }

  function openFormForEdit(trnId: TrnId) {
    const trn = trnsStore.items[trnId]

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
      trn: trnsStore.lastCreatedTrnItem,
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
    modal,
    onChangeAmount,
    onChangeCountSum,
    onChangeTransferType,
    onChangeTrnType,
    onClear,
    onClickCalculator,
    onClose,
    onSubmit,
    openFormForCreate,
    openFormForDuplicate,
    openFormForEdit,
    openTrnFormModal,
    shouldShowSum,
    ui,
    values,
  }
})
