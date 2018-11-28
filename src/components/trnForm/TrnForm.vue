<script>
import moment from 'moment'
import { createId } from '@/utils/id'

import Amount from '@/components/amount/Amount'
import CategoriesView from '@/components/categories/list/CategoriesView'
import Icon from '@/components/icon/Icon'
import TrnFormAmount from '@/components/trnForm/TrnFormAmount'
import TrnFormCalculator from '@/components/trnForm/TrnFormCalculator'
import TrnFormCalendar from '@/components/trnForm/TrnFormCalendar'
import TrnFormModalDescription from '@/components/trnForm/TrnFormModalDescription'
import TrnFormHeader from '@/components/trnForm/TrnFormHeader'
import TrnFormHeaderTransfer from '@/components/trnForm/TrnFormHeaderTransfer'
import TrnFormModalCalendar from '@/components/trnForm/TrnFormModalCalendar'
import TrnFormModalCats from '@/components/trnForm/TrnFormModalCats'
import TrnFormModalCatsChild from '@/components/trnForm/TrnFormModalCatsChild'
import TrnFormModalWallets from '@/components/trnForm/TrnFormModalWallets'
import TrnFormModalTransferFrom from '@/components/trnForm/TrnFormModalTransferFrom'
import TrnFormModalTransferTo from '@/components/trnForm/TrnFormModalTransferTo'
import WalletsList from '@/components/wallets/list/WalletsList'

export default {
  components: {
    Amount,
    CategoriesView,
    Icon,
    TrnFormAmount,
    TrnFormCalculator,
    TrnFormCalendar,
    TrnFormModalDescription,
    TrnFormHeader,
    TrnFormHeaderTransfer,
    TrnFormModalCalendar,
    TrnFormModalCats,
    TrnFormModalCatsChild,
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
    }
  },

  methods: {
    handleSubmitForm () {
      try {
        const isFormValid = this.validateForm()
        if (isFormValid) {
          if (this.$store.state.ui.mobile) {
            this.$store.commit('closeTrnForm')
          } else {
            setTimeout(() => {
              this.$notify({
                group: 'main',
                type: 'success',
                title: 'Added',
                text: 'Cool :)'
              })
            }, 200)
          }

          setTimeout(() => {
            this.isTransfer
              ? this.handleSubmitTrnasfer()
              : this.handleSubmitTrn()
          }, 100)
        }
      } catch (e) {
        console.log(e)
      }
    },

    handleSubmitTrn () {
      const values = { ...this.$store.state.trnForm.values }
      const id = values.trnId || createId()

      this.$store.dispatch('addTrn', {
        id,
        values
      })
    },

    handleSubmitTrnasfer () {
      const newId = createId()
      const values = {
        amount: this.$store.state.trnForm.values.amount,
        categoryId: this.$store.getters.transferCategoryId,
        date: moment(this.$store.state.trnForm.values.date).valueOf()
      }

      // Income
      this.$store.dispatch('addTrn', {
        id: `${newId}-to`,
        values: {
          ...values,
          walletId: this.$store.state.trnForm.transfer.to,
          amountType: 1
        }
      })

      // Expense
      this.$store.dispatch('addTrn', {
        id: `${newId}-from`,
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
        this.$store.commit('setTrnFormHeight', newTrnFormHeight)
      }
    },

    validateForm () {
      const formValues = this.$store.state.trnForm.values
      const formTransferValues = this.$store.state.trnForm.transfer
      const wallets = this.$store.state.wallets.items

      if (!formValues.amount) {
        this.$notify({
          group: 'main',
          type: 'error',
          title: '😮',
          text: 'Amount can not be empty'
        })
        return false
      }
      if (formValues.amount < 0) {
        this.$notify({
          group: 'main',
          type: 'error',
          title: '😮',
          text: 'Amount can not be negative number'
        })
        return false
      }
      if (formValues.amount === 0) {
        this.$notify({
          group: 'main',
          type: 'error',
          title: '😮',
          text: 'Amount can not be equal Zero'
        })
        return false
      }

      if (!formValues.walletId) {
        this.$notify({
          group: 'main',
          type: 'error',
          title: '😮',
          text: 'Please select wallet'
        })
        return false
      }

      if (!formValues.categoryId) {
        this.$notify({
          group: 'main',
          type: 'error',
          title: '😮',
          text: 'Please select category'
        })
        return false
      }

      if (formValues.amountType === 2) {
        if (formTransferValues.from === formTransferValues.to) {
          this.$notify({
            group: 'main',
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
            group: 'main',
            type: 'error',
            title: '🤷',
            text: 'Sorry, transfer between wallets with different currency in development'
          })
          return false
        }
      }
      return true
    }
  }
}
</script>

<template lang="pug">
.trnForm
  //- Overflow
  transition(name="fadeIn")
    .trnForm__overflow(
      v-show="show"
      @click.prevent="$store.dispatch('closeTrnForm')"
    )

  //- Wrap
  transition(name="trnFormAnimation")
    .trnForm__wrap(
      v-show="show"
      ref="trnFormWrapRef"
    )
      //- Header
      TrnFormHeaderTransfer(
        v-if="$store.getters.walletsSortedIds.length > 1"
        v-show="isTransfer")
      TrnFormHeader(v-show="!isTransfer")

      //- Content
      .trnForm__scroll
        .trnForm__content
          template(v-if="$store.state.ui.pc")
            .trnForm__dateAndDesc
              .trnForm__dateAndDesc-date
                TrnFormCalendar
              .trnForm__dateAndDesc-desc(@click="$store.commit('toogleTrnFormModal', 'description')")
                .mdi.mdi-comment-text-outline
          TrnFormAmount(v-on:onFormSubmit="handleSubmitForm")
          template(v-if="$store.state.ui.mobile")
            .trnForm__dateAndDesc
              .trnForm__dateAndDesc-date
                TrnFormCalendar
              .trnForm__dateAndDesc-desc(@click="$store.commit('toogleTrnFormModal', 'description')")
                .mdi.mdi-comment-text-outline

          //- pc
          template(v-if="$store.state.ui.pc")
            div(
              v-if="$store.getters.walletsSortedIds.length > 1"
              v-show="isTransfer")
              .formWallets
                .formTitle(@click="$store.commit('toogleTrnFormModal', 'transferFrom')") From
                WalletsList(
                  :limit="6"
                  ui="tile"
                  v-on:onClick="walletId => $store.commit('setTrnFormTransfer', { tranferType: 'from', walletId })")
              .formWallets
                .formTitle(@click="$store.commit('toogleTrnFormModal', 'transferTo')") To
                WalletsList(
                  :limit="6"
                  ui="tile"
                  v-on:onClick="walletId => $store.commit('setTrnFormTransfer', { tranferType: 'to', walletId })")

            div(v-show="!isTransfer")
              .formWallets
                .formTitle(@click="$store.commit('toogleTrnFormModal', 'wallets')") Wallets
                WalletsList(
                  :limit="3"
                  ui="line"
                  v-on:onClick="walletId => $store.commit('setTrnFormValues', { walletId })")

              .formCategories(v-if="$store.getters.lastUsedCategoriesIds && $store.getters.lastUsedCategoriesIds.length > 0")
                .formTitle(@click="$store.commit('toogleTrnFormModal', 'categories')") Categories
                CategoriesView(
                  :ids="$store.getters.lastUsedCategoriesIds"
                  :noPaddingBottom="true"
                  v-on:onClick="categoryId => $store.commit('setTrnFormValues', { categoryId })")
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

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.trnForm__dateAndDesc
  display flex
  align-items stretch

  @media $media-phone
    border-top 1px solid var(--c-bg-1)

  @media $media-laptop
    min-height 54px
    color var(--c-font-4)
    background var(--c-bg-4)

  &-date
    flex-grow 1

  &-desc
    padding $m7 $m9
    width calc(100%/5)
    font-size 20px
    color var(--c-font-4)
    text-align center
    border-left 1px solid var(--c-bg-1)

  &-date
  &-desc
    &:hover
      @media $media-laptop
        background var(--c-bg-5)

    &:active
      background var(--c-bg-5)
</style>
