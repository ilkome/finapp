<script>
import dayjs from 'dayjs'
import { ref, useContext } from 'nuxt-composition-api'
import generateId from '~/utils/id'
import useTouchClose from '~/composables/useTouchClose'
import { successEmo, random } from '~/assets/js/emo'

export default {
  setup () {
    const scrollContainer = ref(null)
    const scrollContent = ref(null)
    const scrollOverflow = ref(null)
    const scrollDragger = ref(null)

    const { store } = useContext()

    useTouchClose({
      container: scrollContainer,
      content: scrollContent,
      overflow: scrollOverflow,
      dragger: scrollDragger,
      noDragClasss: '.noDrag',
      onClose: () => store.dispatch('trnForm/closeTrnForm')
    })

    return {
      scrollContainer,
      scrollContent,
      scrollOverflow,
      scrollDragger
    }
  },

  computed: {
    show () {
      return this.$store.state.trnForm.show
    },

    trnFormHeader () {
      return 'hey'
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

      const height = this.$refs.scrollContainer.clientHeight
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
    },

    onClose () {
      this.$store.dispatch('trnForm/closeTrnForm')
    }
  }
}
</script>

<template lang="pug">
.trnForm(
  v-if="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories']"
  ref="scrollContainer"
)
  //- overflow
  transition(name="fadeIn")
    .trnForm__overflow(
      ref="scrollOverflow"
      v-show="show"
      @click.prevent="onClose"
    )

  //- wrap
  transition(name="trnFormAnimation")
    .trnForm__wrap(
      v-show="show"
      ref="scrollDragger"
    )

      //- content
      .trnForm__scroll(ref="scrollContent")
        .trnForm__content
          //- .trnForm__header.noDrag {{ trnFormHeader }}

          //- laptop
          template(v-if="$store.state.ui.pc")
            TrnFormCalendar

            //- header
            TrnFormHeaderTransfer(
              v-if="$store.getters['wallets/walletsSortedIds'].length > 1"
              v-show="isTransfer"
            )
            TrnFormHeader(v-show="!isTransfer")

          template(v-if="$store.state.ui.mobile && !isTransfer && $store.getters['categories/quickSelectorCategoriesIds'].length")
            .trnForm__quickWallets(v-if="isShowFirstWallets")
              WalletsList(
                :limit="3"
                ui="widget"
                @onClick="walletId => $store.commit('trnForm/setTrnFormValues', { walletId })"
              )
            .trnForm__quickCats
              CategoriesView(
                :ids="$store.getters['categories/quickSelectorCategoriesIds']"
                ui="_flat"
                @onClick="categoryId => $store.commit('trnForm/setTrnFormValues', { categoryId })")

          TrnFormAmount(
            v-if="$store.state.ui.mobile"
            @handleMath="handleMath"
            @onFormSubmit="handleSubmitForm"
          )
          TrnFormAmountInput(
            v-if="$store.state.ui.pc"
            @onFormSubmit="handleSubmitForm"
          )

          TrnFormCalendar(
            v-if="$store.state.ui.mobile"
          )
          LazyTrnFormCalculator(
            v-if="$store.state.ui.mobile"
            @onFormSubmit="handleSubmitForm"
          )

          //- pc
          template(v-if="$store.state.ui.pc")
            div(v-show="!isTransfer")
              .formWallets
                .formTitle(@click="$store.commit('trnForm/toogleTrnFormModal', 'wallets')") Favorite Wallets
                .trnForm__quickWallets
                  WalletsList(
                    :limit="3"
                    ui="widget"
                    @onClick="walletId => $store.commit('trnForm/setTrnFormValues', { walletId })")

              .formCategories(v-if="$store.getters['categories/quickSelectorCategoriesIds'].length > 0")
                .formTitle(@click="$store.commit('trnForm/toogleTrnFormModal', 'categories')") Favorite Categories
                CategoriesView(
                  ui="_flat"
                  :ids="$store.getters['categories/quickSelectorCategoriesIds']"
                  :noPaddingBottom="true"
                  @onClick="categoryId => $store.commit('trnForm/setTrnFormValues', { categoryId })")

          //- Header
          TrnFormHeaderTransfer(
            v-if="$store.state.ui.mobile && $store.getters['wallets/walletsSortedIds'].length > 1"
            v-show="isTransfer"
          )
          TrnFormHeader(
            v-if="$store.state.ui.mobile"
            v-show="!isTransfer"
          )

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
      opacity .6
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
@import "~assets/stylus/variables/animations"
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

.trnForm
  &__quickCats
    opacity .8

  &__wrap
    overflow hidden
    border-radius 16px 16px 0 0

    &._anim
      anim(300ms)

    @media $media-laptop
      border-radius 16px
</style>
