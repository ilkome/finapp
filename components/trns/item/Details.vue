<script setup lang="ts">
import { formatDate } from '~/utils/formatDate'
import type { TrnId, TrnItem } from '~/components/trns/types'
import type { WalletItem } from '~~/components/wallets/types'
import { useTrnForm } from '~/components/trnForm/useTrnForm'

const props = withDefaults(defineProps<{
  category: object
  isActive?: boolean
  showCategory?: boolean
  trn: TrnItem
  trnId: TrnId
  ui?: string
  wallet: WalletItem
}>(), {
  ui: 'history',
})

const emit = defineEmits<{
  (e: 'onClickEdit', trnId: TrnId): void
}>()

const { $store } = useNuxtApp()
const { trnFormEdit } = useTrnForm()

const className = computed(() => {
  return {
    _active: props.isActive,
    _detailed: props.ui === 'detailed',
    _history: props.ui === 'history' || (props.ui === 'stat' && props.showCategory),
    _stat: props.ui === 'stat',
  }
})

const formattedDate = computed(() => {
  const date = formatDate(props.trn.date, 'full')
  return `${date.weekday}, ${date.day} ${date.month} ${date.year}`
})

const formattedDateDay = computed(() => {
  return formatDate(props.trn.date, 'trnItem')
})

const formattedDateDay2 = computed(() => {
  return formatDate(props.trn.date, 'trnItem')
})

function handleClick() {
  if (!$store.state.trns.modal.show) {
    $store.commit('trns/showTrnModal')
    $store.commit('trns/setTrnModalId', props.trnId)
  }
}

function setTrnEdit() {
  const trnId = props.trnId
  trnFormEdit(trnId)
  emit('onClickEdit', trnId)
}
</script>

<template lang="pug">
.trnItem.py-3.px-3(
  v-if="(category && wallet) || trn.type === 2"
  :class="{ ...className, 'py-2.5': true, '!cursor-default': trn.type === 2 && trn.incomeAmount && trn.expenseAmount }"
  @click="handleClick"
)
  //- Transfer
  template(v-if="trn.type === 2 && trn.incomeAmount && trn.expenseAmount")
    .trnItem__categoryIcon
      Icon(
        :background="category.color"
        :icon="category.icon"
        big
        round
      )
    .trnItem__categoryName {{ $t('trnForm.transferTitle') }}
    .trnItem__date {{ formattedDate }}
    .flex.gap-5.items-center
      //- Expense
      div
        .pb-2
          WalletsItem(
            :id="trn.expenseWalletId"
            :isShowAmount="false"
          )
        .text-2xl.text-skin-item-base
          Amount(
            :amount="trn.expenseAmount"
            :currencyCode="$store.state.wallets.items[trn.expenseWalletId].currency"
            :type="0"
            align="center"
            colorize="expense"
          )

      //- Separator
      .mdi.mdi-chevron-right.text-2xl

      //- Income
      div
        .pb-2
          WalletsItem(
            :id="trn.incomeWalletId"
            :isShowAmount="false"
          )
        .text-2xl.text-skin-item-base
          Amount(
            :amount="trn.incomeAmount"
            :currencyCode="$store.state.wallets.items[trn.incomeWalletId].currency"
            :type="1"
            align="center"
            colorize="income"
          )

    .trnItem__desc.whitespace-pre.font-roboto.leading-none(
      v-if="trn.description"
      class="!dark_text-white/80 !text-xs"
    ) {{ trn.description }}

  //- Transaction
  template(v-else)
    .trnItem__categoryIcon
      Icon(
        :background="category.color"
        :icon="category.icon"
        big
        round
      )
    .trnItem__categoryName {{ category.name }}
    .trnItem__wallet
      .walletIcon
        Icon(
          :abbr="wallet.name"
          :background="wallet.color"
          small
        )

      .walletName {{ wallet.name }}

    .trnItem__date {{ formattedDate }}
    .trnItem__amount.text-4xl(
      @click.stop="setTrnEdit"
    )
      Amount(
        :amount="trn.amount"
        :currencyCode="wallet.currency"
        :colorize="trn.type === 0 ? 'expense' : 'income'"
        :type="trn.type"
        align="center"
      )

    .trnItem__desc(v-if="trn.description") {{ trn.description }}
</template>

<style lang="stylus" scoped>
.trnItem
  position relative
  color var(--c-font-4)
  display flex
  flex-flow column
  align-items center
  justify-content center
  margin-bottom -10px
  text-align center

  &__amount
    align-self center
    padding-top $m5

  &__categoryIcon
    margin-top -38px
    padding-bottom 12px

  &__categoryName
    white-space nowrap
    overflow hidden
    text-overflow ellipsis
    padding-bottom $m6
    color var(--c-font-2)
    font-size 22px
    fontFamilyNunito()

  &__date
    padding-bottom $m8
    font-size 14px

  &__desc
    color var(--c-font-2)
    font-size 14px
    padding-top $m7

  &__wallet
    display flex
    align-items center
    padding-bottom $m6

    .walletIcon
      margin-right 8px

    .walletName
      font-size 14px
      white-space nowrap

    .walletName
      font-size 16px
</style>
