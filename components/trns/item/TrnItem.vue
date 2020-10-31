<script>
import { formatDate } from '~/utils/formatDate'

export default {
  props: {
    category: {
      type: Object,
      required: true
    },
    trn: {
      type: Object,
      required: true
    },
    trnId: {
      type: String,
      required: true
    },
    wallet: {
      type: Object,
      required: true
    },

    ui: {
      type: String,
      default: 'history'
    }
  },

  computed: {
    className () {
      return {
        _detailed: this.ui === 'detailed',
        _history: this.ui === 'history',
        _stat: this.ui === 'stat'
      }
    },
    formatedDate () {
      const date = formatDate(this.trn.date, 'full')
      return `${date.weekday}, ${date.day} ${date.month} ${date.year}`
    },
    formatedDateDay () {
      return formatDate(this.trn.date, 'numberDay')
    },
    formatedDateDay2 () {
      return formatDate(this.trn.date, 'trnItem')
    },

    filterTrnsDate () {
      const date = this.trn.date
      const walletId = this.trn.walletId

      const trns = this.$store.state.trns.items
      const trnsIds = Object.keys(trns)
        .filter(id => trns[id].date <= date && trns[id].walletId === walletId)

      const total = this.$store.getters['trns/getTotalOfTrnsIds'](trnsIds, true)
      return total
    }
  },

  methods: {
    handleClick () {
      if (!this.$store.state.trns.modal.show) {
        this.$store.commit('categories/hideCategoryModal')
        this.$store.commit('trns/showTrnModal')
        this.$store.commit('trns/setTrnModalId', this.trnId)
      }
    },

    setTrnEdit () {
      const trnId = this.trnId
      this.$store.dispatch('trnForm/openTrnForm', { action: 'edit', trnId })
    }
  }
}
</script>

<template lang="pug">
.trnItem(
  v-if="(category && wallet) || trn.type === 2"
  @click="handleClick"
  :class="className"
)
  //- Transfer
  //---------------------------------------------------------------------------
  template(v-if="trn.type === 2")
    //- Transfer: Detailed
    //---------------------------------------------------------------------------
    template(v-if="ui === 'detailed'")
      .trnItem__categoryIcon
        Icon(
          background="var(--c-bg-3)"
          icon="mdi mdi-repeat"
          big
          round
        )
      .trnItem__categoryName {{ $t('trnForm.transferTitle') }}
      .trnItem__date {{ formatedDate }}
      .trnItem__wallet
        WalletItem(
          :id="trn.fromWalletId"
          ui="tile"
        )
        .trnFormHeaderSeparator: .mdi.mdi-chevron-right
        WalletItem(
          :id="trn.toWalletId"
          ui="tile"
        )

      .trnItem__desc(v-if="trn.description") {{ trn.description }}

      .trnItem__amount(@click.stop="setTrnEdit")
        Amount(
          :currency="$store.state.wallets.items[trn.fromWalletId].currency"
          :value="trn.fromAmount"
          :type="trn.type"
          vertical="center"
          size="xl"
        )

    //- Transfer: History
    //-------------------------------------------------------------------------
    template(v-else)
      .trnItem__categoryIcon
        Icon(
          background="var(--c-bg-3)"
          icon="mdi mdi-repeat"
          round
        )

      .trnItem__categoryName
        div {{ $t('trnForm.transferTitle') }}
        .transfer
          div {{ $t('trnForm.transfer.fromShort') }}: {{ $store.state.wallets.items[trn.fromWalletId].name }}
          div {{ $t('trnForm.transfer.toShort') }}: {{ $store.state.wallets.items[trn.toWalletId].name }}

      .trnItem__amount(@click.stop="setTrnEdit")
        Amount(
          :currency="$store.state.wallets.items[trn.fromWalletId].currency"
          :isColorize="false"
          :type="0"
          :value="trn.fromAmount"
          isShowPrefix
        )
        Amount(
          :currency="$store.state.wallets.items[trn.toWalletId].currency"
          :isColorize="false"
          :type="1"
          :value="trn.toAmount"
          isShowPrefix
        )

      .trnItem__desc
        div(v-if="trn.description") {{ trn.description }}

  //- Transaction
  //---------------------------------------------------------------------------
  template(v-else)
    //- Detailed
    //-------------------------------------------------------------------------
    template(v-if="ui === 'detailed'")
      .trnItem__categoryIcon
        Icon(
          :background="category.color"
          big
          :icon="category.icon"
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

      .trnItem__date {{ formatedDate }}
      .trnItem__amount(@click.stop="setTrnEdit")
        Amount(
          :currency="wallet.currency"
          :type="trn.type"
          :value="trn.amount"
          vertical="center"
          size="xl"
          isShowPrefix
        )

      .trnItem__desc(v-if="trn.description") {{ trn.description }}

    //- Stat
    //-------------------------------------------------------------------------
    template(v-else-if="ui === 'stat'")
      .trnItem__statWrap
        .trnItem__date {{ formatedDateDay }}
        .trnItem__wallet
          .walletIcon
            Icon(
              :abbr="wallet.name"
              :background="wallet.color"
              :small="true")
          .walletName {{ wallet.name }}
        .trnItem__desc(v-if="trn.description") {{ trn.description }}
        .trnItem__amount(@click.stop="setTrnEdit")
          Amount(
            :currency="wallet.currency"
            :value="trn.amount"
            :type="trn.type"
            isShowPrefix
          )

    //- History
    //-------------------------------------------------------------------------
    template(v-else)
      .trnItem__categoryIcon
        Icon(
          :background="category.color"
          :icon="category.icon"
          round
        )

      .trnItem__categoryName
        | {{ category.name }}
        .trnItem__groups(v-if="trn.groups") In group
        .trnItem__budgets(v-if="trn.budgets") In budget

      .trnItem__walletFloatIcon
        Icon(
          :abbr="wallet.name"
          :background="wallet.color"
          :small="true"
        )

      .trnItem__amount(@click.stop="setTrnEdit")
        Amount(
          :currency="wallet.currency"
          :value="trn.amount"
          :type="trn.type"
          :isColorize="trn.type === 1"
          isShowPrefix
        )

      .trnItem__desc
        div(v-if="trn.description") {{ trn.description }}
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

.transfer
  padding-top $m5
  font-size 14px

.trnFormHeaderSeparator
  color var(--c-font-1)
  font-size 32px

.trnItem
  position relative
  color var(--c-font-4)

  &._detailed
    display flex
    flex-flow column
    align-items center
    justify-content center
    margin-top -38px
    margin-bottom -10px
    text-align center

  &._history
    display grid
    grid-template-columns minmax(10px, max-content) 1fr minmax(10px, max-content)
    grid-column-gap 28px
    margin-top -1px
    padding 0 16px
    padding-top 10px

    &:first-child
      margin-top 0

  &._stat
    margin-top -1px
    padding-top 10px
    padding-right 10px
    padding-left 68px

    @media $media-laptop
      padding-left 62px

  &:hover
    &._history
    &._stat
      @media $media-laptop
        background var(--c-bg-5)

        /.light-mode &
          background var(--c-bg-5)

  &__amount
    align-self center

    ^[0]._history &
      grid-column 3 / 4
      grid-row 1 / 2

    ^[0]._stat &
      margin-left auto

  &__categoryIcon
    ^[0]._detailed &
      padding-bottom 12px

  &__categoryName
    white-space nowrap
    overflow hidden
    text-overflow ellipsis

    ^[0]._detailed &
      padding-bottom $m6
      color var(--c-font-2)
      font-size 22px
      fontFamilyNunito()

    ^[0]._history &
      grid-column 2 / 3
      grid-row 1 / 2
      align-self center

  &__date
    font-size 13px

    ^[0]._detailed &
      padding-bottom $m8
      font-size 14px

    ^[0]._stat &
      padding-right 20px

  &__desc
    color var(--c-font-2)
    font-size 14px

    ^[0]._detailed &
      padding-top $m7

    ^[0]._history &
      grid-column 2 / 4
      grid-row 2 / 3
      padding-top 5px
      padding-bottom 5px

    ^[0]._stat &
      overflow hidden
      padding-right 10px
      white-space nowrap
      text-overflow ellipsis

  &__statWrap
    display flex
    align-items center
    padding-bottom 10px
    border-bottom 1px solid var(--c-bg-6)

    ^[0]._stat:hover &
      @media $media-laptop
        border-color transparent

    ^[0]._stat:last-child &
      border-color transparent

  &__wallet
    ^[0]._detailed &
    ^[0]._stat &
      display flex
      align-items center

      .walletIcon
        margin-right 8px

      .walletName
        font-size 14px
        white-space nowrap

    ^[0]._detailed &
      padding-bottom $m6

      .walletName
        font-size 16px

    ^[0]._stat &
      padding-right 20px

  &__walletFloatIcon
    position absolute
    top 24px
    left 35px

  &__groups
  &__budgest
    display inline-block
    padding-left 10px
    font-size 10px
</style>
