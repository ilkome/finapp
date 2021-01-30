<script>
import Swiper from 'swiper'
import 'swiper/swiper-bundle.css'
import { ref, useContext } from '@nuxtjs/composition-api'
import generateId from '~/utils/id'
import useTouchClose from '~/composables/useTouchClose'
import { successEmo, random } from '~/assets/js/emo'

export default {
  name: 'TrnForm',

  setup () {
    const { store } = useContext()

    const scrollContainer = ref(null)
    const scrollContent = ref(null)
    const scrollOverflow = ref(null)
    const scrollDragger = ref(null)

    const { onCloseModal } = useTouchClose({
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
      scrollDragger,
      onCloseModal
    }
  },

  data () {
    return {
      slider: null
    }
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
            if (this.slider) {
              this.slider.update()
            }
            else {
              this.slider = new Swiper(this.$refs.slider, {
                slidesPerView: 1,
                autoHeight: true,
                initialSlide: 0,
                shortSwipes: false,
                longSwipesRatio: 0.1,
                longSwipesMs: 60
              })
            }
          })
        }
      },
      immediate: true
    },

    amountType () {
      this.$nextTick(() => {
        this.setTrnFormHeight()
        setTimeout(() => {
          this.slider.update()
        }, 1)
      })
    }
  },

  mounted () {
    //
  },

  methods: {
    handleSubmitForm () {
      try {
        const isFormValid = this.validateForm()
        if (isFormValid) {
          this.showSuccess()

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
      const id = values.trnId || generateId(this.$day().valueOf())

      this.$store.dispatch('trns/addTrn', {
        id,
        values
      })
    },

    handleSubmitTrnasfer () {
      const values = {
        amount: this.$store.state.trnForm.values.amount,
        categoryId: this.$store.getters['categories/transferCategoryId'],
        date: this.$day(this.$store.state.trnForm.values.date).valueOf()
      }

      // Income
      this.$store.dispatch('trns/addTrn', {
        id: generateId(this.$day().valueOf()),
        values: {
          ...values,
          walletId: this.$store.state.trnForm.transfer.to,
          amountType: 1
        }
      })

      // Expense
      this.$store.dispatch('trns/addTrn', {
        id: generateId(this.$day().valueOf()),
        values: {
          ...values,
          walletId: this.$store.state.trnForm.transfer.from,
          amountType: 0
        }
      })
    },

    setTrnFormHeight () {
      const trnFormHeight = this.$store.state.trnForm.height

      const height = this.$refs.getHeight.clientHeight + 8
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
.trnForm(
  v-if="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories']"
  ref="scrollContainer"
)
  //- Overflow
  transition(name="hey")
    .trnForm__overflow(
      ref="scrollOverflow"
      v-if="show"
      @click.prevent="onCloseModal"
    )

  //- wrap
  transition(name="trnFormAnimation")
    .trnForm__wrap(
      v-show="show"
      ref="scrollDragger"
      :style="{ maxHeight: `${$store.state.trnForm.height}px` }"
    )
      .trnForm__handler

      //- Content
      .trnForm__scroll(ref="scrollContent")
        .trnForm__content
          .swiper-container(ref="slider")
            .swiper-wrapper
              .swiper-slide(ref="getHeight")
                .trnForm__title(v-if="$store.state.trnForm.values.trnId") {{ $t('trnForm.titleEditTrn') }}
                .trnForm__title(v-if="!$store.state.trnForm.values.trnId") {{ $t('trnForm.titleCreateTrn') }}

                //- Laptop
                template(v-if="$store.state.ui.pc")
                  TrnFormHeader
                  TrnFormHeaderTransfer(v-if="isTransfer")
                  TrnFormCalendar
                  TrnFormAmountInput(@onFormSubmit="handleSubmitForm")
                  template(v-if="$store.getters['categories/quickSelectorCategoriesIds'].length")
                    .trnForm__quickCats
                      .formTitle {{ $t('categories.favoriteTitle') }}
                      CategoriesView(
                        :ids="$store.getters['categories/quickSelectorCategoriesIds']"
                        ui="_flat"
                        :noPaddingBottom="true"
                        @onClick="categoryId => $store.commit('trnForm/setTrnFormValues', { categoryId })"
                      )

                //- Mobile
                template(v-if="$store.state.ui.mobile")
                  TrnFormAmount(
                    @handleMath="handleMath"
                    @onFormSubmit="handleSubmitForm"
                  )
                  TrnFormCalendar
                  LazyTrnFormCalculator(
                    v-if="$store.state.ui.mobile"
                    @onFormSubmit="handleSubmitForm"
                  )
                  TrnFormHeader
                  TrnFormHeaderTransfer(v-if="isTransfer")

              .swiper-slide(:style="{ minHeight: `${$store.state.trnForm.height}px` }")
                template(v-if="slider")
                  TrnFormTrns(
                    :slider="slider"
                    onlyList
                  )

      //- Modals
      TrnFormModalCats
      TrnFormModalCatsChild
      TrnFormModalCalendar
      TrnFormModalDescription
      TrnFormModalWallets
      TrnFormModalTransferFrom
      TrnFormModalTransferTo
      TrnFormModalTrn
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/animations'
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/media'

.trnForm
  &__title
    padding $m8
    padding-bottom 0
    color var(--c-font-3)
    font-size 16px
    font-weight 700
    letter-spacing .5px
    text-align center
    fontFamilyNunito()

    @media $media-laptop
      padding-bottom $m7

  &__quickCats
    opacity .8
    padding-bottom $m7

    &:hover
      opacity 1

  &__wrap
    overflow hidden
    position relative
    border-radius 16px 16px 0 0

    &._anim
      anim(200ms)

    @media $media-laptop
      border-radius 16px

  &__content
    padding-top 8px

  &__handler
    z-index 2
    position absolute
    top 0
    left 0
    display flex
    align-items center
    justify-content center
    width 100%
    height 16px

    &:after
      content ''
      display block
      width 32px
      height 4px
      background var(--c-bg-8)
      border-radius 4px
</style>
