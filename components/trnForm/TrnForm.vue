<script lang="ts">
// @ts-ignore
import Swiper from 'swiper'
import 'swiper/swiper-bundle.css'
import { ref, useContext } from '@nuxtjs/composition-api'
// @ts-ignore
import generateId from '~/utils/id'
// @ts-ignore
import useTouchClose from '~/composables/useTouchClose'
// @ts-ignore
import useCalculator from '~/components/trnForm/calculator/useCalculator'
// @ts-ignore
import useTrnFormValidate from '~/components/trnForm/useTrnFormValidate'
// @ts-ignore
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
    // @ts-ignore
    show () {
      // @ts-ignore
      return this.$store.state.trnForm.show
    },

    // @ts-ignore
    isTransfer () {
      // @ts-ignore
      return this.$store.state.trnForm.values.amountType === 2
    },

    // @ts-ignore
    amountType () {
      // @ts-ignore
      return this.$store.state.trnForm.values.amountType
    },

    isShowFirstWallets () {
      // @ts-ignore
      if (this.$store.getters['wallets/walletsSortedIds'].length >= 3) { return true }
      return false
    }
  },

  watch: {
    // @ts-ignore
    show: {
      // @ts-ignore
      handler (show) {
        if (show) {
          // @ts-ignore
          this.$nextTick(() => {
            // @ts-ignore
            this.setTrnFormHeight()
            // @ts-ignore
            if (this.slider) {
              // @ts-ignore
              this.slider.update()
              // @ts-ignore
              this.slider.slideTo(0, 0)
            }
            else {
              // @ts-ignore
              this.slider = new Swiper(this.$refs.slider, {
                slidesPerView: 1,
                autoHeight: true,
                initialSlide: 0,
                noSwipingClass: 'trnFormNoSwiping',
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
      // @ts-ignore
      this.$nextTick(() => {
        // @ts-ignore
        this.setTrnFormHeight()
        setTimeout(() => {
          // @ts-ignore
          this.slider.update()
        }, 1)
      })
    }
  },

  methods: {
    handleSubmitForm () {
      try {
        const { validate } = useTrnFormValidate()
        const { getResult } = useCalculator()

        const validateStatus = validate({
          // @ts-ignore
          ...this.$store.state.trnForm.values,
          amount: getResult.value,
          // @ts-ignore
          walletFrom: this.$store.getters['wallets/getWalletWithId'](this.$store.state.trnForm.transfer.from),
          // @ts-ignore
          walletTo: this.$store.getters['wallets/getWalletWithId'](this.$store.state.trnForm.transfer.to)
        })

        // @ts-ignore
        if (validateStatus.error) {
          // @ts-ignore
          this.$notify({
            type: 'error',
            // @ts-ignore
            title: validateStatus.error.title,
            // @ts-ignore
            text: validateStatus.error.text
          })

          return
        }
        else {
          this.showSuccess()
          // @ts-ignore
          this.isTransfer
            // @ts-ignore
            ? this.handleSubmitTrnasfer()
            // @ts-ignore
            : this.handleSubmitTrn()
        }
      }
      catch (e) {
        console.log(e)
      }
    },

    handleSubmitTrn () {
      const { getResult } = useCalculator()

      // @ts-ignore
      const values = {
        // @ts-ignore
        ...this.$store.state.trnForm.values,
        amount: getResult.value
      }

      // @ts-ignore
      const id = values.trnId || generateId(this.$day().valueOf())

      // @ts-ignore
      this.$store.dispatch('trns/addTrn', {
        id,
        values
      })
    },

    handleSubmitTrnasfer () {
      const { getResult } = useCalculator()

      const values = {
        // @ts-ignore
        amount: getResult.value,
        // @ts-ignore
        categoryId: this.$store.getters['categories/transferCategoryId'],
        // @ts-ignore
        date: this.$day(this.$store.state.trnForm.values.date).valueOf()
      }

      // @ts-ignore
      const id = generateId(this.$day().valueOf())

      // Income
      // @ts-ignore
      this.$store.dispatch('trns/addTrn', {
        // @ts-ignore
        id: id + 'incomes',
        values: {
          ...values,
          // @ts-ignore
          walletId: this.$store.state.trnForm.transfer.to,
          amountType: 1
        }
      })

      // Expense
      // @ts-ignore
      this.$store.dispatch('trns/addTrn', {
        // @ts-ignore
        id: id + 'expenses',
        values: {
          ...values,
          // @ts-ignore
          walletId: this.$store.state.trnForm.transfer.from,
          amountType: 0
        }
      })
    },

    setTrnFormHeight () {
      // @ts-ignore
      const trnFormHeight = this.$store.state.trnForm.height

      // @ts-ignore
      const height = this.$refs.getHeight.clientHeight + 8
      const trnFormHeaderHeight = 0
      const newTrnFormHeight = height - trnFormHeaderHeight

      if (trnFormHeight !== newTrnFormHeight) {
        // @ts-ignore
        this.$store.commit('trnForm/setTrnFormHeight', newTrnFormHeight)
      }
    },

    showSuccess () {
      const emo = random(successEmo)
      // @ts-ignore
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
      :style="{ maxHeight: `${$store.state.trnForm.height}px` }"
      ref="scrollDragger"
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
                  TrnFormAmountPc
                  TrnFormCalculator(
                    pc
                    @onSubmit="handleSubmitForm"
                  )
                  .trnFormNoSwiping2(v-if="$store.getters['categories/quickSelectorCategoriesIds'].length")
                    //- TrnFormCategories(:show="show")
                    .trnForm__quickCats
                      .formTitle {{ $t('categories.favoriteTitle') }}
                      CategoriesView(
                        :ids="$store.getters['categories/quickSelectorCategoriesIds']"
                        :noPaddingBottom="true"
                        ui="_flat"
                        @onClick="categoryId => $store.commit('trnForm/setTrnFormValues', { categoryId })"
                      )

                //- Mobile
                template(v-if="$store.state.ui.mobile")
                  TrnFormAmount
                  TrnFormCalendar
                  TrnFormCalculator(@onSubmit="handleSubmitForm")
                  TrnFormHeader
                  TrnFormHeaderTransfer(v-if="isTransfer")

              .swiper-slide(:style="{ minHeight: `${$store.state.trnForm.height}px` }")
                div(v-if="slider")
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
      border-radius 16px

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
