<script>
import useCalculator from '~/components/trnForm/calculator/useCalculator'
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
    },

    showCategory: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    className () {
      return {
        _active: this.isActive,
        _detailed: this.ui === 'detailed',
        _history: this.ui === 'history' || (this.ui === 'stat' && this.showCategory),
        _stat: this.ui === 'stat'
      }
    },
    formatedDate () {
      const date = formatDate(this.trn.date, 'full')
      return `${date.weekday}, ${date.day} ${date.month} ${date.year}`
    },
    formatedDateDay () {
      return formatDate(this.trn.date, 'trnItem')
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
      const { setExpression } = useCalculator()
      setExpression(this.trn.amount)
      this.$store.dispatch('trnForm/openTrnForm', { action: 'edit', trnId })
      this.$store.commit('stat/setCategoryModal', { id: null, type: null })
      this.$emit('onClickEdit', this.trnId)
    }
  }
}
</script>

<template lang="pug">
.trnItem(
  v-if="(category && wallet) || trn.type === 2"
  :class="className"
  @click="handleClick"
)
  //- Transfer
  //---------------------------------------------------------------------------
  template(v-if="trn.type === 2")
    //- Transfer: Detailed
    //---------------------------------------------------------------------------
    template(v-if="ui === 'detailed'")
      .trnItem__categoryIcon
        Icon(
          :background="category.color"
          :icon="category.icon"
          big
          round
        )
      .trnItem__categoryName {{ $t('trnForm.transferTitle') }}
      .trnItem__date {{ formatedDate }}
      .trnItem__wallet
        WalletsItemWalletItem(
          :id="trn.walletFromId"
          ui="tile"
        )
        .trnFormHeaderSeparator: .mdi.mdi-chevron-right
        WalletsItemWalletItem(
          :id="trn.walletToId"
          ui="tile"
        )
      .trnItem__amount(@click.stop="setTrnEdit")
        Amount(
          :currency="$store.state.wallets.items[trn.walletFromId].currency"
          :value="trn.amountFrom"
          :type="2"
          vertical="center"
          size="xl"
        )

      .trnItem__desc(v-if="trn.description") {{ trn.description }}

    //- Transfer: History
    //-------------------------------------------------------------------------
    template(v-else)
      .trnItem__left
        .trnItem__categoryIcon
          Icon(
            :background="category.color"
            :icon="category.icon"
            round
          )

      .trnItem__center
        .trnItem__categoryName
          div {{ $t('trnForm.transferTitle') }}
          .transfer
            div
              span {{ $t('trnForm.transfer.from') }}:
              | {{ $store.state.wallets.items[trn.walletFromId].name }}
            div
              span {{ $t('trnForm.transfer.to') }}:
              | {{ $store.state.wallets.items[trn.walletToId].name }}

        .trnItem__desc(v-if="trn.description") {{ trn.description }}

      .trnItem__right
        .trnItem__amount(@click.stop="setTrnEdit")
          Amount(
            :currency="$store.state.wallets.items[trn.walletFromId].currency"
            :isColorize="false"
            :type="2"
            :value="trn.amountFrom"
          )

  //- Transaction
  //---------------------------------------------------------------------------
  template(v-else)
    //- Detailed
    //-------------------------------------------------------------------------
    template(v-if="ui === 'detailed'")
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

    //- Stat no category
    //-------------------------------------------------------------------------
    template(v-else-if="ui === 'stat' && !showCategory")
      .trnItem__statWrap
        .trnItem__date {{ $t(formatedDateDay) }}

        .trnItem__wallet
          .walletIcon
            Icon(
              :abbr="wallet.name"
              :background="wallet.color"
              small
            )
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
      .trnItem__left
        .trnItem__categoryIcon
          Icon(
            :background="category.color"
            :icon="category.icon"
            round
          )

      .trnItem__center
        .trnItem__categoryName
          | {{ category.name }}
          .trnItem__groups(v-if="trn.groups") In group
          .trnItem__budgets(v-if="trn.budgets") In budget

        .trnItem__wallet
          .trnItem__walletIcon
            Icon(
              :abbr="wallet.name"
              :background="wallet.color"
              :small="true"
            )
          .trnItem__walletName {{ wallet.name }}

        .trnItem__desc(v-if="trn.description") {{ trn.description }}

      .trnItem__right
        .trnItem__amount(@click.stop="setTrnEdit")
          Amount(
            :currency="wallet.currency"
            :value="trn.amount"
            :type="trn.type"
            :isColorize="trn.type === 1"
            isShowPrefix
          )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.transfer
  padding-top $m5
  font-size 14px

  span
    padding-right 2px
    color var(--c-font-3)
    font-size 11px

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
    margin-bottom -10px
    text-align center

  &._stat
    margin-top -1px
    padding-top $m6
    padding-right 0
    border-bottom $m2

  +media-hover(true)
    &._history
    &._stat
      background var(--c-bg-5)

  &__amount
    align-self center

    ^[0]._stat &
      margin-left auto

  &__categoryIcon
    ^[0]._detailed &
      margin-top -38px
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

  &__date
    font-size 13px

    ^[0]._detailed &
      padding-bottom $m8
      font-size 14px

    ^[0]._stat &
      padding-right $m7

  &__desc
    color var(--c-font-2)
    font-size 14px

    ^[0]._detailed &
      padding-top $m7

    ^[0]._stat &
      overflow hidden
      padding-right 0
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

  &__groups
  &__budgest
    display inline-block
    padding-left 10px
    font-size 10px

// Stat
// ----------------------------------------------------------------------------
.trnItem._stat._history
  padding 0

// History
// ----------------------------------------------------------------------------
.trnItem
  &._history
    display grid
    grid-template-columns minmax(10px, max-content) 1fr minmax(10px, max-content)
    grid-column-gap $m7
    margin-top -1px
    padding $m6 0

    @media $media-laptop
      padding $m6 $m7

    &:first-child
      margin-top 0

  &__wallet
    display flex
    align-items center
    font-size 12px

  &__walletIcon
    padding-right $m4

  &__walletName
    font-size 12px

  &__desc
    ^[0]._history &
      padding-top $m6
      color var(--c-font-3)
      font-size 11px

  &__categoryName
    ^[0]._history &
      padding-bottom $m4
      color var(--c-font-2)
      font-size 14px

  &__amount
    ^[0]._history &
      //

  &._active
  &._history
  &._trnForm
    margin-right - ($m7)
    margin-left - ($m7)
    padding-right ($m7)
    padding-left ($m7)

  &._active
    background var(--c-bg-1)
    border-top 1px solid var(--c-blue-1)
    border-bottom 1px solid var(--c-blue-1)
</style>
