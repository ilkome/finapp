import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import type { CategoryId } from '../categories/types'
import type { WalletId } from '../wallets/types'
import type { AmountsType, TrnFormUi, TrnFormValues } from '~/components/trnForm/types'
import type { TransferType, TrnId, TrnItem } from '~/components/trns/types'
import { TrnType } from '~/components/trns/types'
import { formatInput, getSum } from '~/components/trnForm/utils/calculate'
import { formatTransaction, formatTransfer } from '~/components/trnForm/utils/formatData'
import { generateId } from '~/utils/generateId'
import { random, successEmo } from '~/assets/js/emo'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { validate } from '~/components/trnForm/utils/validate'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

export const useTrnFormStore = defineStore('trnForm', () => {
  const values = reactive<TrnFormValues>({
    trnId: null,
    amount: [0, 0, 0],
    amountRaw: ['', '', ''],
    date: dayjs().valueOf(),
    desc: undefined,
    transferType: 0,
    trnType: 0,
    walletId: null,
    categoryId: null,
    incomeWalletId: null,
    expenseWalletId: null,
  })

  const ui = ref<TrnFormUi>({
    isShow: false,
    walletsTab: 'all',
    walletsModal: false,
    walletTransferModal: false,
    walletTransferType: 'expense',
    catsRootModal: false,
    walletsViewAs: 'big',
    tab: 'main',
  })

  const modal = ref({
    categories: false,
    description: false,
    transferFrom: false,
    transferTo: false,
    wallets: false,
    trn: false,
  })

  function closeTrnFormModal(name: keyof typeof modal.value) {
    modal.value[name] = false
  }

  function openTrnFormModal(name: keyof typeof modal.value) {
    modal.value[name] = true
  }

  /**
   * Active amount idx
   */
  const activeAmountIdx = computed(() =>
    values.trnType !== TrnType.Transfer
      ? 0
      : 1 + values.transferType,
  )

  /**
   * Change amount
   */
  function onChangeAmount(amountRaw: string) {
    values.amount[activeAmountIdx.value] = getSum(amountRaw)
    values.amountRaw[activeAmountIdx.value] = formatInput(amountRaw)
  }

  /**
   * Get is show sum
   */
  // TODO: refactor isTransferAuto
  function getIsShowSum(trnType: TrnType | AmountsType, isTransferAuto = false) {
    if (isTransferAuto && trnType === 2) {
      const expense = values.amount[1] !== 0
        && formatInput(values.amount[1]) !== values.amountRaw[1]
      const income = values.amount[2] !== 0
        && formatInput(values.amount[2]) !== values.amountRaw[2]

      return expense || income
    }

    return values.amount[trnType] !== 0
      && formatInput(values.amount[trnType]) !== values.amountRaw[trnType]
  }

  /**
   * Change trn type
   */
  function onChangeTrnType(trnType: TrnType) {
    values.trnType = trnType
  }

  /**
   * Change transfer type
   */

  // TODO: not working when use tab keyboard
  function onChangeTransferType(transferType: TransferType) {
    values.transferType = transferType
  }

  /**
   * Clear form
   */
  function onClear() {
    values.amount = [0, 0, 0]
    values.amountRaw = ['', '', '']
    values.desc = undefined
    values.trnId = null
    // values.trnType = 0

    // values.date = dayjs().valueOf()
    // values.walletId = null
    // values.categoryId = null
    // values.incomeWalletId = null
    // values.expenseWalletId = null
  }

  function onClose() {
    if (values.trnId)
      onClear()

    ui.value.isShow = false
  }

  /**
   * Set Values
   */
  type Values = {
    categoriesIds: CategoryId[]
    trn: TrnItem
    walletsIds: WalletId[]
  } & ({
    action: 'create'
  } | {
    action: 'edit' | 'duplicate'
    trnId: TrnId
  })

  function setValues(props: Values) {
    values.trnId = null

    if (props.action === 'create') {
      values.walletId = props.trn?.walletId ?? props.walletsIds[0]
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
      values.desc = props.trn.desc || props.trn.description
      values.date = props.trn.date
    }
  }

  /**
   * Submit
   */
  async function onSubmit() {
    const data = values.trnType !== 2
      ? formatTransaction(values)
      : formatTransfer(values)

    try {
      const validateStatus = validate(data)

      if (validateStatus.error) {
        // vue.notify({
        //   type: 'error',
        //   title: validateStatus.error.title,
        //   text: validateStatus.error.text,
        // })
        return
      }

      // TODO: translate
      // vue.notify({
      //   type: 'success',
      //   text: 'Excellent transaction!',
      //   title: random(successEmo),
      // })

      return {
        id: values.trnId ?? generateId(),
        values: data,
      }
    }
    catch (e) {
      return false
    }
  }

  /**
   * onChangeCountSum
   */
  function onChangeCountSum() {
    // Transfer
    if (values.trnType === 2) {
      values.amountRaw[1] = formatInput(values.amount[1])
      values.amountRaw[2] = formatInput(values.amount[2])
      return
    }

    // Transaction
    values.amountRaw[values.trnType] = formatInput(values.amount[values.trnType])
  }

  return {
    activeAmountIdx,
    values,
    ui,
    // dates,

    modal,
    closeTrnFormModal,
    openTrnFormModal,

    setValues,
    getIsShowSum,
    onChangeAmount,
    onChangeTransferType,
    onChangeTrnType,
    onChangeCountSum,
    onClear,
    onSubmit,
    onClose,
  }
})

export function useTrnForm() {
  const $trnForm = useTrnFormStore()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()

  const categoriesIds = computed(() => categoriesStore.categoriesIdsForTrnValues)
  const walletIds = computed(() => walletsStore.walletsSortedIds)

  function trnFormEdit(trnId: TrnId) {
    const trn = trnsStore.items[trnId]

    $trnForm.setValues({
      action: 'edit',
      categoriesIds: categoriesIds.value,
      trn,
      trnId,
      walletsIds: walletIds.value,
    })
    $trnForm.ui.isShow = true
  }

  function trnFormCreate() {
    $trnForm.setValues({
      action: 'create',
      categoriesIds: categoriesIds.value,
      trn: trnsStore.lastCreatedTrnItem,
      walletsIds: walletIds.value,
    })
    $trnForm.ui.isShow = true
  }

  function trnFormCreate2(categoryId: CategoryId) {
    $trnForm.setValues({
      action: 'create',
      categoriesIds: categoriesIds.value,
      trn: trnsStore.lastCreatedTrnItem,
      walletsIds: walletIds.value,
    })
    $trnForm.ui.isShow = true
    $trnForm.values.categoryId = categoryId
  }

  function trnFormDuplicate(trnId: TrnId) {
    const trn = trnsStore.items[trnId]

    $trnForm.setValues({
      action: 'duplicate',
      categoriesIds: categoriesIds.value,
      trn,
      trnId,
      walletsIds: walletIds.value,
    })
    $trnForm.ui.isShow = true
  }

  return {
    trnFormEdit,
    trnFormCreate,
    trnFormCreate2,
    trnFormDuplicate,
  }
}
