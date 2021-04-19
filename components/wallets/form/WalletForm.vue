<script>
import generateId from '~/utils/id'
import colors from '~/assets/js/colors'

export default {
  data () {
    return {
      showColors: false,
      showCurrencies: false,
      wallet: {
        name: null,
        order: 1,
        countTotal: true,
        currency: 'RUB',
        color: this.$store.state.ui.defaultBgColor
      }
    }
  },

  computed: {
    walletId () {
      return this.$store.state.wallets.editId
    }
  },

  watch: {
    walletId: {
      handler (walletId) {
        if (walletId) {
          this.wallet = {
            ...this.wallet,
            ...this.$store.state.wallets.items[this.walletId]
          }
        }
      },
      immediate: true
    }
  },

  created () {
    this.colors = colors
    if (!this.$store.state.wallets.editId) {
      this.wallet.color = colors[Math.floor(Math.random() * colors.length)]
    }
  },

  beforeDestroy () {
    this.$store.commit('wallets/setWalletEditId', null)
  },

  methods: {
    handleColorSelect (color) {
      this.wallet.color = color
      this.showColors = false
    },
    handleCurrencySelect (currency) {
      this.wallet.currency = currency
      this.showCurrencies = false
    },

    handleSubmit () {
      if (this.validateForm()) {
        const id = this.walletId || generateId()

        const walletsValues = {
          color: this.wallet.color,
          countTotal: this.wallet.countTotal,
          currency: this.wallet.currency,
          name: this.wallet.name,
          order: this.wallet.order
        }

        this.$store.dispatch('wallets/addWallet', { id, values: walletsValues })
        this.$store.commit('wallets/setWalletEditId', null)
        this.$store.dispatch('ui/setActiveTab', 'wallets')

        if (this.$listeners.callback) { this.$listeners.callback() }
      }
    },

    validateForm () {
      const wallets = this.$store.state.wallets.items
      // name
      if (!this.wallet.name) {
        this.$notify({
          title: '😮',
          text: this.$t('wallets.form.name.error')
        })
        return false
      }

      // currency
      if (!this.wallet.currency) {
        this.$notify({
          title: '😮',
          text: this.$t('wallets.form.currency.error')
        })
        return false
      }

      for (const walletId in wallets) {
        if (wallets[walletId].name === this.wallet.name) {
          if (this.walletId) {
            if (this.walletId !== walletId) {
              this.$notify({
                title: '😮',
                text: this.$t('wallets.form.name.exist')
              })
              return false
            }
          }
          else {
            this.$notify({
              title: '😮',
              text: this.$t('wallets.form.name.exist')
            })
            return false
          }
        }
      }

      return true
    }
  }
}
</script>

<template lang="pug">
LayoutComponentWrap
  template(slot="headerLeft")
    template(v-if="!walletId") {{ $t('wallets.createNewTitle') }}
    template(v-else) {{ $t('wallets.editTitle') }}

  template(slot="content")
    .form
      .form-line._text
        .inputText
          input(
            type="text"
            :placeholder="$t('wallets.form.name.placeholder')"
            v-model="wallet.name"
          ).inputText__value
          .inputText__label {{ $t('wallets.form.name.label') }}

      .form__btns
        .form__btns__i
          .form-line(@click="showCurrencies = true")
            .inputModal._flex
              .inputModal__value {{ wallet.currency }}
              .inputModal__content
              .inputModal__label {{ $t('wallets.form.currency.label') }}

        .form__btns__i
          .form-line(@click="showColors = true")
            .inputModal._flex
              .inputModal__value: .inputModal__color(:style="{ background: wallet.color }")
              .inputModal__label {{ $t('wallets.form.color.label') }}

      .form-line._p0._clean
        SharedInputsCheckbox(
          v-model="wallet.countTotal"
          :title="$t('wallets.form.total.placeholder')"
          :alt="true"
        )

    //- colors
    Portal(
      v-if="showColors"
      to="modal"
    )
      ModalBottom(
        :center="true"
        :title="$t('wallets.form.color.placeholder')"
        @onClose="showColors = false"
      )
        .inputText
          .inputText__colors
            .colors
              .colorItem(
                :class="{ _active: wallet.color === color }"
                :style="{ background: color }"
                @click="handleColorSelect(color)"
                v-for="color in colors")
        .customColor
          .customColor__title {{ $t('wallets.form.color.custom') }}
          input.customColor__value(v-model="wallet.color" type="color")

    //- currencies
    Portal(
      v-if="showCurrencies"
      to="modal"
    )
      ModalBottom(
        :center="true"
        :title="$t('wallets.form.currency.placeholder')"
        @onClose="showCurrencies = false"
      )
        .inputText
          .currencies
            .currencies__item(
              :class="{ _active: wallet.currency === currency }"
              @click="handleCurrencySelect(currency)"
              v-for="(item, currency) in $store.state.currencies.rates"
            ) {{ currency }}

  template(slot="bottom")
    .col
      SharedButton(
        :class="['_text-center _blue2', { _inline: $store.state.ui.pc }]"
        :title="$t('wallets.form.save')"
        @onClick="handleSubmit")
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables"

.customColor
  margin (- $m7)
  margin-top 0
  padding $m7
  background var(--c-bg-1)

  @media $media-laptop
    margin (- $m9)
    margin-top 0
    padding $m9

  &__title
    padding-bottom $m6
    color var(--c-font-4)

  &__value
    width 100%
    height 40px
    margin 0
    padding 0
    border 0

.form
  @media $media-laptop
    max-width 380px

.form__actions
  @media $media-phone
    text-align center

.form__btns
  display grid
  grid-template-columns repeat(2, 1fr)
  grid-column-gap $m9
  grid-row-gap $m9
  padding-bottom $m9

  +media-laptop()
    grid-column-gap $m10
    grid-row-gap $m10
    padding-bottom 24px

  &__i._full
    grid-column 1 / -1

  .form-line
    display flex
    align-items center
    justify-content center
    height 100%
    height 56px
    margin-bottom 0

    +media-laptop()
      height auto

.inputModal
  &._flex
    flex 1
    display flex
    align-items center
    justify-content space-between

  &__content
    display flex

  &__label
    margin 0
    padding 0
    font-size 10px
</style>
