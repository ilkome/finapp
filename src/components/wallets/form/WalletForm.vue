<script>
import { focus } from 'vue-focus'
import { db } from '@/firebase'
import { createId } from '@/utils/id'
import colors from '@/components/ui/store/colors'

import Button from '@/components/shared/button/Button'
import Checkbox from '@/components/shared/inputs/Checkbox'
import ModalBottom from '@/components/modal/ModalBottom'

export default {
  components: {
    Button,
    Checkbox,
    ModalBottom
  },

  directives: { focus },

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
    this.$store.commit('setWalletEditId', null)
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
        const uid = this.$store.state.user.user.uid
        const id = this.walletId || createId()

        const walletsValues = {
          color: this.wallet.color,
          countTotal: this.wallet.countTotal,
          currency: this.wallet.currency,
          name: this.wallet.name,
          order: parseInt(this.wallet.order) || 1
        }

        db.ref(`users/${uid}/accounts/${id}`).set(walletsValues)

        this.$store.commit('setWalletEditId', null)
        this.$store.dispatch('setActiveTab', 'wallets')

        if (this.$listeners.callback) this.$listeners.callback()
      }
    },

    validateForm () {
      const wallets = this.$store.state.wallets.items
      // name
      if (!this.wallet.name) {
        this.$notify({
          group: 'main',
          title: '😮',
          text: 'Write wallet name'
        })
        return false
      }

      // currency
      if (!this.wallet.currency) {
        this.$notify({
          group: 'main',
          title: '😮',
          text: 'Write wallet currency'
        })
        return false
      }

      for (const walletId in wallets) {
        if (wallets[walletId].name === this.wallet.name) {
          if (this.walletId) {
            if (this.walletId !== walletId) {
              this.$notify({
                group: 'main',
                title: '😮',
                text: 'Wallet with same name is exist'
              })
              return false
            }
          } else {
            this.$notify({
              group: 'main',
              title: '😮',
              text: 'Wallet with same name is exist'
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
.component
  .form
    h1.component__title
      template(v-if="!walletId") Create new wallet
      template(v-else) Edit wallet

    .form-line._text
      .inputText
        input(
          type="text"
          placeholder="Write wallet name..."
          v-model="wallet.name"
          v-focus.lazy="$store.state.ui.pc"
        ).inputText__value
        .inputText__label Wallet name

    .form-line._text(v-if="$store.getters.hasCategories")
      .inputText
        input(
          type="number"
          placeholder="Wallet order..."
          value="1"
          v-model="wallet.order"
        ).inputText__value
        .inputText__label Wallet order

    .form__btns
      .form__btns__i
        .form-line(@click="showCurrencies = true")
          .inputModal._flex
            .inputModal__value {{ wallet.currency }}
            .inputModal__content
            .inputModal__label Currency

      .form__btns__i
        .form-line(@click="showColors = true")
          .inputModal._flex
            .inputModal__value: .inputModal__color(:style="{ background: wallet.color }")
            .inputModal__label Color

    .form-line._p0._clean
      Checkbox(
        v-model="wallet.countTotal"
        title="Count amount of this wallet in total"
      )

    .form__actions
      Button(
        className="_blue"
        title="Save wallet"
        v-on:onClick="handleSubmit"
      )

  //- colors
  ModalBottom(
    :center="true"
    :show="showColors"
    title="Select color"
    v-on:onClose="showColors = false")
    .inputText
      .inputText__colors
        .colors
          .colorItem(
            :class="{ _active: wallet.color === color }"
            :style="{ background: color }"
            @click="handleColorSelect(color)"
            v-for="color in colors")
    .customColor
      .customColor__title Select your color
      input.customColor__value(v-model="wallet.color" type="color")

  //- currencies
  ModalBottom(
    :center="true"
    :show="showCurrencies"
    title="Select currency"
    v-on:onClose="showCurrencies = false"
  )
    .inputText
      .currencies
        .currencies__item(
          :class="{ _active: wallet.currency === $store.state.currencies.base }"
          @click="handleCurrencySelect($store.state.currencies.base)"
        ) {{ $store.state.currencies.base }}

        .currencies__item(
          :class="{ _active: wallet.currency === currency }"
          @click="handleCurrencySelect(currency)"
          v-for="(item, currency) in $store.state.currencies.items"
        ) {{ currency }}
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.customColor
  margin (- $m7)
  margin-top 0
  padding $m7
  background var(--c-bg-1)

  &__title
    padding-bottom $m6
    color var(--c-font-4)

  &__value
    width 100%
    height 40px
    margin 0
    padding 0
    border 0

.component
  width 100%

  @media $media-phone
    margin 0 auto
    padding $m9

  &__title
    padding-bottom $m10

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

  @media $media-laptop
    grid-column-gap $m10
    grid-row-gap $m10
    padding-bottom $m10

  &__i._full
    grid-column 1 / -1

  .form-line
    display flex
    align-items center
    justify-content center
    height 100%
    height 56px
    margin-bottom 0

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

.currencies
  display flex
  flex-wrap wrap

  &__item
    flex 1
    text-align center
    margin 0 -1px -1px 0
    padding $m7 $m7
    border 1px solid var(--c-bg-6)

    &:hover
      @media $media-laptop
        background var(--c-bg-6)

    &._active
      color var(--c-font-1)
      background var(--c-bg-8)
</style>
