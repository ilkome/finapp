import dayjs from 'dayjs'
import type { ToastOptions } from 'vue3-toastify'
import { defineStore } from 'pinia'
import UiToastContent from '~/components/ui/ToastContent.vue'
import type { CategoryId } from '~/components/categories/types'
import type { TransferType, TrnId, TrnItem } from '~/components/trns/types'
import type { TrnFormUi, TrnFormValues } from '~/components/trnForm/types'
import type { WalletId } from '~/components/wallets/types'
import { TrnType } from '~/components/trns/types'
import { errorEmo, random, successEmo } from '~/assets/js/emo'
import { formatInput, getSum } from '~/components/trnForm/utils/calculate'
import { formatTransaction, formatTransfer } from '~/components/trnForm/utils/formatData'
import { generateId } from '~~/utils/generateId'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { validate } from '~/components/trnForm/utils/validate'

export const useTrnFormStore = defineStore('trnForm', () => {
  const { $toast } = useNuxtApp()
  const trnFormStore = useTrnFormStore()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()

  const values = reactive<TrnFormValues>({
    amount: [0, 0, 0],
    amountRaw: ['', '', ''],
    categoryId: null,
    date: dayjs().valueOf(),
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
    walletsTab: 'all',
    walletsViewAs: 'big',
    walletTransferModal: false,
    walletTransferType: 'expense',
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

    // return values.amount[values.trnType] !== 0
    //   && formatInput(values.amount[values.trnType]) !== values.amountRaw[values.trnType]
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
    walletId?: WalletId
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
      values.trnType = 0
      values.walletId = props.walletId ?? props.trn?.walletId ?? props.walletsIds[0]
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
    trnFormStore.ui.isShow = true
  }

  function trnFormCreate(props?: { categoryId?: CategoryId, walletId?: WalletId }) {
    setValues({

      action: 'create',
      categoriesIds: categoriesStore.categoriesIdsForTrnValues,
      trn: trnsStore.lastCreatedTrnItem,
      walletId: props?.walletId ?? walletsStore.sortedIds[0],
      walletsIds: walletsStore.sortedIds,
    })
    trnFormStore.ui.isShow = true

    if (props) {
      if (props.categoryId)
        trnFormStore.values.categoryId = props.categoryId
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

    trnFormStore.ui.isShow = true
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
