<script>
import dayjs from 'dayjs'
import generateId from '~/utils/id'
import { successEmo, errorEmo, random } from '~/assets/js/emo'

import Amount from '~/components/amount/Amount'
import CategoriesView from '~/components/categories/list/CategoriesView'
import Icon from '~/components/icon/Icon'
import TrnFormAmount from '~/components/trnForm/TrnFormAmount'
import TrnFormAmountInput from '~/components/trnForm/TrnFormAmountInput'
import TrnFormCalculator from '~/components/trnForm/TrnFormCalculator'
import TrnFormCalendar from '~/components/trnForm/TrnFormCalendar'
import TrnFormHeader from '~/components/trnForm/TrnFormHeader'
import TrnFormHeaderTransfer from '~/components/trnForm/TrnFormHeaderTransfer'
import TrnFormModalCalendar from '~/components/trnForm/TrnFormModalCalendar'
import TrnFormModalCats from '~/components/trnForm/TrnFormModalCats'
import TrnFormModalCatsChild from '~/components/trnForm/TrnFormModalCatsChild'
import TrnFormModalDescription from '~/components/trnForm/TrnFormModalDescription'
import TrnFormModalTransferFrom from '~/components/trnForm/TrnFormModalTransferFrom'
import TrnFormModalTransferTo from '~/components/trnForm/TrnFormModalTransferTo'
import TrnFormModalWallets from '~/components/trnForm/TrnFormModalWallets'
import WalletsList from '~/components/wallets/list/WalletsList'

export default {
  components: {
    Amount,
    CategoriesView,
    Icon,
    TrnFormAmount,
    TrnFormAmountInput,
    TrnFormCalculator,
    TrnFormCalendar,
    TrnFormHeader,
    TrnFormHeaderTransfer,
    TrnFormModalCalendar,
    TrnFormModalCats,
    TrnFormModalCatsChild,
    TrnFormModalDescription,
    TrnFormModalTransferFrom,
    TrnFormModalTransferTo,
    TrnFormModalWallets,
    WalletsList
  },

  computed: {
    show () {
      return this.$store.state.trnForm.show
    },
    isTransfer () {
      return this.$store.state.trnForm.values.amountType === 2
    },

    amountType () {
      return this.$store.state.trnForm.values.amountType
    },

    isShowFirstWallets () {
      if (this.$store.getters['wallets/walletsSortedIds'].length >= 3) { return true }

      return false
    }
  },

  watch: {
    show: {
      handler (show) {
        if (show) {
          this.$nextTick(() => {
            this.setTrnFormHeight()
          })
        }
      },
      immediate: true
    },

    amountType () {
      this.$nextTick(() => {
        this.setTrnFormHeight()
      })
    }
  },

  methods: {
    handleSubmitForm () {
      try {
        const isFormValid = this.validateForm()
        if (isFormValid) {
          if (this.$store.state.trnForm.values.trnId) {
            this.$store.commit('trnForm/closeTrnForm')
          }

          setTimeout(() => {
            this.showSuccess()
          }, 200)

          setTimeout(() => {
            this.isTransfer
              ? this.handleSubmitTrnasfer()
              : this.handleSubmitTrn()
          }, 100)
        }
      }
      catch (e) {
        console.log(e)
      }
    },

    handleSubmitTrn () {
      const values = { ...this.$store.state.trnForm.values }
      const id = values.trnId || generateId(dayjs().valueOf())

      this.$store.dispatch('trns/addTrn', {
        id,
        values
      })
    },

    handleSubmitTrnasfer () {
      const values = {
        amount: this.$store.state.trnForm.values.amount,
        categoryId: this.$store.getters['categories/transferCategoryId'],
        date: dayjs(this.$store.state.trnForm.values.date).valueOf()
      }

      // Income
      this.$store.dispatch('trns/addTrn', {
        id: generateId(dayjs().valueOf()),
        values: {
          ...values,
          walletId: this.$store.state.trnForm.transfer.to,
          amountType: 1
        }
      })

      // Expense
      this.$store.dispatch('trns/addTrn', {
        id: generateId(dayjs().valueOf()),
        values: {
          ...values,
          walletId: this.$store.state.trnForm.transfer.from,
          amountType: 0
        }
      })
    },

    setTrnFormHeight () {
      const trnFormHeight = this.$store.state.trnForm.height

      const height = this.$refs.trnFormWrapRef.clientHeight
      const trnFormHeaderHeight = 0
      const newTrnFormHeight = height - trnFormHeaderHeight

      if (trnFormHeight !== newTrnFormHeight) {
        this.$store.commit('trnForm/setTrnFormHeight', newTrnFormHeight)
      }
    },

    handleMath () {
      if (this.$store.state.trnForm.values.amountEvaluation) {
        const amount = Number(this.$store.state.trnForm.values.amountEvaluation).toLocaleString('ru-RU')
        this.$store.commit('trnForm/setTrnFormValues', {
          amount,
          amountEvaluation: null
        })
      }
    },

    validateForm () {
      const formValues = this.$store.state.trnForm.values
      const formTransferValues = this.$store.state.trnForm.transfer
      const wallets = this.$store.state.wallets.items
      console.log(formValues.amount)
      if (!formValues.amount) {
        this.$notify({
          type: 'error',
          title: '😮',
          text: 'Amount can not be empty'
        })
        return false
      }
      if (formValues.amount < 0) {
        this.$notify({
          type: 'error',
          title: '😮',
          text: 'Amount can not be negative number'
        })
        return false
      }
      if (+formValues.amount === 0) {
        this.$notify({
          type: 'error',
          title: '😮',
          text: 'Amount can not be equal Zero'
        })
        return false
      }

      if (!formValues.walletId) {
        this.$notify({
          type: 'error',
          title: '😮',
          text: 'Please select wallet'
        })
        return false
      }

      if (!formValues.categoryId) {
        this.$notify({
          type: 'error',
          title: '😮',
          text: 'Please select category'
        })
        return false
      }

      if (formValues.amountType === 2) {
        if (formTransferValues.from === formTransferValues.to) {
          this.$notify({
            type: 'error',
            title: '😮',
            text: 'Transfer in same wallet'
          })
          return false
        }

        const walletFrom = wallets[formTransferValues.from]
        const walletTo = wallets[formTransferValues.to]

        if (walletFrom.currency !== walletTo.currency) {
          this.$notify({
            type: 'error',
            title: '🤷',
            text: 'Sorry, transfer between wallets with different currency in development'
          })
          return false
        }
      }
      return true
    },

    showSuccess () {
      const emo = random(successEmo)
      this.$notify({
        type: 'success',
        text: 'Excellent transaction!',
        title: emo
      })
    }
  }
}
</script>

<template lang="pug">
.trnForm(v-if="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories']")
  //- Overflow
  transition(name="fadeIn")
    .trnForm__overflow(
      v-show="show"
      @click.prevent="$store.dispatch('trnForm/closeTrnForm')"
    )

  //- Wrap
  transition(name="trnFormAnimation")
    .trnForm__wrap(
      v-show="show"
      ref="trnFormWrapRef"
    )
      //- Header
      TrnFormHeaderTransfer(
        v-if="$store.getters['wallets/walletsSortedIds'].length > 1"
        v-show="isTransfer")
      TrnFormHeader(v-show="!isTransfer")

      //- Content
      .trnForm__scroll
        .trnForm__content
          template(v-if="$store.state.ui.pc")
            .trnForm__dateAndDesc
              .trnForm__dateAndDesc-date
                TrnFormCalendar
              .trnForm__dateAndDesc-desc(@click="$store.commit('trnForm/toogleTrnFormModal', 'description')")
                .mdi.mdi-comment-text-outline

          template(v-if="$store.state.ui.mobile && !isTransfer && $store.getters['categories/quickSelectorCategoriesIds'].length")
            .trnForm__quickWallets(v-if="isShowFirstWallets")
              WalletsList(
                :limit="3"
                ui="widget"
                v-on:onClick="walletId => $store.commit('trnForm/setTrnFormValues', { walletId })")

            .trnForm__quickCats
              CategoriesView(
                :ids="$store.getters['categories/quickSelectorCategoriesIds']"
                ui="_flat"
                @onClick="categoryId => $store.commit('trnForm/setTrnFormValues', { categoryId })")

          TrnFormAmount(
            @onFormSubmit="handleSubmitForm"
            @handleMath="handleMath"
          )
          TrnFormAmountInput(
            v-if="$store.state.ui.pc"
            @onFormSubmit="handleSubmitForm"
          )

          template(v-if="$store.state.ui.mobile")
            .trnForm__dateAndDesc
              .trnForm__dateAndDesc-date
                TrnFormCalendar
              .trnForm__dateAndDesc-desc(@click="$store.commit('trnForm/toogleTrnFormModal', 'description')")
                .mdi.mdi-comment-text-outline

          //- pc
          template(v-if="$store.state.ui.pc")
            div(
              v-if="$store.getters['wallets/walletsSortedIds'].length > 1"
              v-show="isTransfer")
              .formWallets
                .formTitle(@click="$store.commit('trnForm/toogleTrnFormModal', 'transferFrom')") From
                WalletsList(
                  :limit="6"
                  ui="tile"
                  v-on:onClick="walletId => $store.commit('trnForm/setTrnFormTransfer', { tranferType: 'from', walletId })")
              .formWallets
                .formTitle(@click="$store.commit('trnForm/toogleTrnFormModal', 'transferTo')") To
                WalletsList(
                  :limit="6"
                  ui="tile"
                  v-on:onClick="walletId => $store.commit('trnForm/setTrnFormTransfer', { tranferType: 'to', walletId })")

            div(v-show="!isTransfer")
              .formWallets
                .formTitle(@click="$store.commit('trnForm/toogleTrnFormModal', 'wallets')") Wallets
                .trnForm__quickWallets
                  WalletsList(
                    :limit="3"
                    ui="widget"
                    v-on:onClick="walletId => $store.commit('trnForm/setTrnFormValues', { walletId })")

              .formCategories(v-if="$store.getters['categories/quickSelectorCategoriesIds'].length > 0")
                .formTitle(@click="$store.commit('trnForm/toogleTrnFormModal', 'categories')") Favorite Categories
                CategoriesView(
                  ui="_flat"
                  :ids="$store.getters['categories/quickSelectorCategoriesIds']"
                  :noPaddingBottom="true"
                  v-on:onClick="categoryId => $store.commit('trnForm/setTrnFormValues', { categoryId })")
          //- pc: end

          template(v-if="$store.state.ui.mobile")
            TrnFormCalculator(v-on:onFormSubmit="handleSubmitForm")

      //- Modals
      TrnFormModalCats
      TrnFormModalCatsChild
      TrnFormModalCalendar
      TrnFormModalDescription
      TrnFormModalWallets
      TrnFormModalTransferFrom
      TrnFormModalTransferTo
</template>

<style lang="stylus">
@import "~assets/stylus/variables/margins"

.trnForm
  &__quickWallets
    padding-bottom 16px

    .walletsWidget
      display grid
      grid-template-columns repeat(3, minmax(auto, 1fr))
      grid-column-gap 12px
      grid-row-gap 12px
      padding 0 16px
      padding-top 12px

    .walletItemWidget
      overflow hidden
      border-radius $m4

.formWallets
  .walletsWidget
    padding-top 0

</style>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

.trnForm
  &__wrap
    overflow hidden
    border-radius 16px 16px 0 0

    @media $media-laptop
      border-radius 16px

.trnForm__dateAndDesc
  display flex
  align-items stretch
  border-top 1px solid var(--c-bg-3)
  border-bottom 1px solid var(--c-bg-3)

  @media $media-laptop
    min-height 54px
    color var(--c-font-4)
    background var(--c-bg-4)
    border-bottom 1px solid var(--c-bg-3)
    border-top 0

  &-date
    flex-grow 1

  &-desc
    width calc(100%/5)
    padding $m7 $m9
    color var(--c-font-4)
    font-size 20px
    text-align center
    border-left 1px solid var(--c-bg-3)
</style>
