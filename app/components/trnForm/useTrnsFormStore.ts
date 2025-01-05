import { generateId } from '~~/utils/generateId'
import { defineStore } from 'pinia'

import type { CategoryId } from '~/components/categories/types'
import type { TrnFormUi } from '~/components/trnForm/types'
import type { TransferType, TrnFormValues, TrnId, TrnItem } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { errorEmo, random } from '~/assets/js/emo'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { type CalculatorKey, createExpressionString, evaluateExpression, formatInput } from '~/components/trnForm/utils/calculate'
import { formatTransaction, formatTransfer } from '~/components/trnForm/utils/formatData'
import { validate } from '~/components/trnForm/utils/validate'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import UiToastContent from '~/components/ui/ToastContent.vue'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

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
  const { $toast } = useNuxtApp()
  const trnsFormStore = useTrnsFormStore()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()

  const values = reactive<TrnFormValues>({
    amount: [0, 0, 0],
    amountRaw: ['', '', ''],
    categoryId: null,
    date: new Date().getTime(),
    desc: undefined,
    expenseWalletId: null,
    incomeWalletId: null,
    transferType: 0,
    trnId: null,
    trnType: 0,
    walletId: null,
  })

  const ui = ref<TrnFormUi>({
    catsRootModal: false,
    isShow: false,
    walletsModal: false,
  })

  const modal = ref({
    categories: false,
    description: false,
    transferFrom: false,
    transferTo: false,
    trn: false,
    wallets: false,
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
      : 1 + values.transferType,
  )

  function onChangeAmount(amountRaw: string) {
    values.amount[activeAmountIdx.value] = evaluateExpression(amountRaw)
    values.amountRaw[activeAmountIdx.value] = formatInput(amountRaw)
  }

  function onClickCalculator(key: CalculatorKey) {
    const value = createExpressionString(key, values.amountRaw[activeAmountIdx.value] ?? '')
    onChangeAmount(value)
  }

  function getIsShowSum() {
    if (values.trnType === 2) {
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

  function onChangeTransferType(transferType: TransferType) {
    values.transferType = transferType
  }

  function onClear() {
    values.amount = [0, 0, 0]
    values.amountRaw = ['', '', '']
    values.desc = undefined
    values.trnId = null
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
      if (!values.walletId)
        values.walletId = props.walletId ?? props.trn?.walletId ?? props.walletsIds[0]
      if (!values.categoryId)
        values.categoryId = props.trn?.categoryId ?? props.categoriesIds[0]

      values.incomeWalletId = props.walletsIds[0]
      values.expenseWalletId = props.walletsIds[1]
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
    const data = values.trnType !== 2
      ? formatTransaction(values)
      : formatTransfer(values)

    try {
      const validateStatus = validate(data)

      if (validateStatus.error) {
        $toast(UiToastContent, {
          data: {
            description: validateStatus.error,
            title: random(errorEmo),
          },
          toastId: 'trn-form-error',
          type: 'error',
        })
        return
      }

      return {
        id: values.trnId ?? generateId(),
        values: data,
      }
    }
    catch (e) {
      console.error(e)
      return false
    }
  }

  function onChangeCountSum() {
    // Transfer
    if (values.trnType === 2) {
      values.amountRaw[1] = formatInput(values.amount[1])
      values.amountRaw[2] = formatInput(values.amount[2])
      return
    }

    // Transaction
    if (values.amount[0] !== 0) {
      values.amountRaw[0] = formatInput(values.amount[0])
      return
    }

    // Clear to placeholder
    values.amountRaw[0] = '888'
  }

  function trnFormEdit(trnId: TrnId) {
    const trn = trnsStore.items[trnId]

    setValues({
      action: 'edit',
      categoriesIds: categoriesStore.categoriesIdsForTrnValues,
      trn,
      trnId,
      walletsIds: walletsStore.sortedIds,
    })
    trnsFormStore.ui.isShow = true
  }

  function trnFormCreate(props?: { categoryId?: CategoryId, walletId?: WalletId }) {
    setValues({
      action: 'create',
      categoriesIds: categoriesStore.categoriesIdsForTrnValues,
      trn: trnsStore.lastCreatedTrnItem,
      walletId: props?.walletId ?? walletsStore.sortedIds[0],
      walletsIds: walletsStore.sortedIds,
    })
    trnsFormStore.ui.isShow = true

    if (props) {
      if (props.categoryId)
        trnsFormStore.values.categoryId = props.categoryId
    }
  }

  function trnFormDuplicate(trnId: TrnId) {
    const trn = trnsStore.items?.[trnId]

    if (!trn)
      return

    if (trn.type !== TrnType.Transfer) {
      setValues({
        action: 'duplicate',
        amount: trn.amount,
        categoriesIds: categoriesStore.categoriesIdsForTrnValues,
        trn,
        trnId,
        walletsIds: walletsStore.sortedIds,
      })
    }

    trnsFormStore.ui.isShow = true
  }

  return {
    activeAmountIdx,
    closeTrnFormModal,
    getIsShowSum,
    modal,
    onChangeAmount,
    onChangeCountSum,
    onChangeTransferType,
    onChangeTrnType,
    onClear,
    onClickCalculator,
    onClose,
    onSubmit,
    openTrnFormModal,
    setValues,
    trnFormCreate,
    trnFormDuplicate,
    trnFormEdit,
    ui,
    values,
  }
})
