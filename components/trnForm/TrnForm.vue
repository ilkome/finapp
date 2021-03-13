<script lang="ts">
// @ts-ignore
import Swiper from 'swiper'
import 'swiper/swiper-bundle.css'
import { ref, computed, watch, reactive, toRefs, useContext } from '@nuxtjs/composition-api'
// @ts-ignore
import generateId from '~/utils/id'
// @ts-ignore
import useTouchClose from '~/components/base/modal/useTouchClose.ts'

// @ts-ignore
import useCalculator from '~/components/trnForm/calculator/useCalculator'
// @ts-ignore
import useTrnFormValidate from '~/components/trnForm/useTrnFormValidate'
// @ts-ignore
import { successEmo, random } from '~/assets/js/emo'

export default {
  name: 'TrnForm',

  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },

  setup (props: any) {
    const { store } = useContext()

    const { isShow } = toRefs(props)
    const { initTouchModal, closeModal } = useTouchClose()

    const wrappers = reactive({
      container: ref(null),
      content: ref(null),
      handler: ref(null),
      overflow: ref(null),
      wrap: ref(null),
      config: {
        doNotTouchClassName: 'doNotCloseTrnModal'
      }
    })

    const slider = ref<any>(null)
    const getHeight = ref<any>(null)
    const sliderObj = ref<any>(null)
    const { clearExpression } = useCalculator()

    function setTrnFormHeight () {
      const trnFormHeight = store.state.trnForm.height
      const height = getHeight.value.clientHeight + 8
      const trnFormHeaderHeight = 0
      const newTrnFormHeight = height - trnFormHeaderHeight

      if (trnFormHeight !== newTrnFormHeight) {
        store.commit('trnForm/setTrnFormHeight', newTrnFormHeight)
      }
    }

    /**
     * Watch isShow
     */
    watch(isShow, (value) => {
      if (value) {
        setTimeout(() => {
          initTouchModal({
            ...toRefs(wrappers),
            onClose: () => store.dispatch('trnForm/closeTrnForm')
          })

          setTrnFormHeight()
          if (sliderObj.value) {
            sliderObj.value.update()
            sliderObj.value.slideTo(0, 0)
          }
          else {
            sliderObj.value = new Swiper(slider.value, {
              slidesPerView: 1,
              autoHeight: true,
              initialSlide: 0,
              noSwipingClass: 'trnFormNoSwiping',
              shortSwipes: false,
              longSwipesRatio: 0.1,
              longSwipesMs: 60
            })
          }
        }, 10)
      }
      else {
        clearExpression()
      }
    }, { immediate: true })

    /**
     * Watch amountType
     */
    const amountType = computed(() => store.state.trnForm.values.amountType)
    watch(amountType, () => {
      setTimeout(() => {
        setTrnFormHeight()
        sliderObj.value.update()
      }, 10)
    })

    return {
      ...toRefs(wrappers),
      closeModal,

      sliderObj,
      slider,
      getHeight,

      amountType
    }
  },

  computed: {
    show (): any {
      // @ts-ignore
      return this.$store.state.trnForm.show
    },

    isTransfer (): any {
      // @ts-ignore
      return this.$store.state.trnForm.values.amountType === 2
    },

    isShowFirstWallets (): any {
      // @ts-ignore
      if (this.$store.getters['wallets/walletsSortedIds'].length >= 3) { return true }
      return false
    }
  },

  methods: {
    handleSubmitForm () {
      try {
        const { validate } = useTrnFormValidate()
        // @ts-ignore
        const { id, values } = this.prepeareValues(this.isTransfer)

        const validateStatus = validate({
          ...values,
          // @ts-ignore
          walletFrom: this.$store.getters['wallets/getWalletWithId'](this.$store.state.trnForm.values.walletFromId),
          // @ts-ignore
          walletTo: this.$store.getters['wallets/getWalletWithId'](this.$store.state.trnForm.values.walletToId)
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

        // @ts-ignore
        this.$notify({
          type: 'success',
          text: 'Excellent transaction!',
          title: random(successEmo)
        })
        // @ts-ignore
        this.$store.dispatch('trns/addTrn', { id, values })
      }
      catch (e) {
        console.log(e)
      }
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

    prepeareValues (isTransfer: boolean): any {
      let normalizedValues
      // @ts-ignore
      const id = this.$store.state.trnForm.values.trnId || generateId(this.$day().valueOf())
      const { getResult } = useCalculator()

      // Simple
      if (!isTransfer) {
        normalizedValues = {
          // @ts-ignore
          amount: getResult.value,
          // @ts-ignore
          amountFrom: getResult.value,
          // @ts-ignore
          amountTo: getResult.value,
          // @ts-ignore
          categoryId: this.$store.state.trnForm.values.categoryId,
          // @ts-ignore
          date: this.$day(this.$store.state.trnForm.values.date).valueOf(),
          // @ts-ignore
          description: this.$store.state.trnForm.values.description || null,
          // @ts-ignore
          groups: this.$store.state.trnForm.values.groups || null,
          // @ts-ignore
          type: Number(this.$store.state.trnForm.values.amountType) || 0,
          // @ts-ignore
          walletId: this.$store.state.trnForm.values.walletId
        }
      }

      // Transfer
      if (isTransfer) {
        normalizedValues = {
          // @ts-ignore
          amount: getResult.value,
          // @ts-ignore
          // @ts-ignore
          amountFrom: getResult.value,
          // @ts-ignore
          amountTo: getResult.value,
          categoryId: 'transfer',
          // @ts-ignore
          date: this.$day(this.$store.state.trnForm.values.date).valueOf(),
          // @ts-ignore
          walletId: this.$store.state.trnForm.values.walletFromId,
          // @ts-ignore
          walletFromId: this.$store.state.trnForm.values.walletFromId,
          // @ts-ignore
          walletToId: this.$store.state.trnForm.values.walletToId,
          type: 2,
          // @ts-ignore
          description: this.$store.state.trnForm.values.description || null,
          // @ts-ignore
          groups: this.$store.state.trnForm.values.groups || null
        }
      }

      return {
        id,
        values: normalizedValues
      }
    }
  }
}
</script>

<template lang="pug">
.trnForm(
  v-if="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories']"
  v-show="isShow"
  ref="container"
)
  //- Overflow
  transition(name="baseModalOveflowAnim" appear)
    .trnForm__overflow(
      ref="overflow"
      v-show="isShow"
      @click="closeModal"
    )

  //- wrap
  transition(name="baseModalWrapAnim" appear)
    .trnForm__wrap(
      v-show="isShow"
      :style="{ maxHeight: `${$store.state.trnForm.height}px` }"
      ref="wrap"
    )
      .trnForm__handler(
        @click="closeModal"
        ref="handler"
      )

      //- Content
      .trnForm__scroll(ref="content")
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
                div(v-if="sliderObj")
                  TrnFormTrns(
                    :slider="sliderObj"
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

$transition-style = cubic-bezier(.17, .04, .03, 1)

.baseModalOveflowAnim
  &-enter-active
  &-leave-active
    opacity 1
    transition all 250ms $transition-style

  &-enter
  &-leave-to
    opacity 0

.baseModalWrapAnim
  &-enter-active
  &-leave-active
    opacity 0
    transform translate3d(0, 50px, 0)
    transition opacity 300ms $transition-style, transform 250ms $transition-style

    +media-ipad()
      transform translate3d(50px, 0, 0)

  &-enter-to
    transform translate3d(0, 0, 0)

  &-leave
  &-enter-to
  &-leave-to
    opacity 1

.trnForm
  &__overflow
    position fixed
    top 0
    right 0
    width 100%
    height 100%
    anim()

    +media-ipad()
      width 440px

  &__wrap
    // width 700px
    // max-width 760px
    border 1px solid var(--c-bg-1)
    box-shadow 0 0 10px 5px var(--c-bg-1)

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
