<script lang="ts">
import dayjs from 'dayjs'
import Swiper, { Pagination } from 'swiper'
import 'swiper/swiper-bundle.css'
import { ref, computed, watch, reactive, toRefs, useContext } from '@nuxtjs/composition-api'
import generateId from '~/utils/id'
import useTouchClose from '~/components/base/modal/useTouchClose'

import useCalculator from '~/components/trnForm/calculator/useCalculator'
import useTrnFormValidate from '~/components/trnForm/useTrnFormValidate'
import { successEmo, random } from '~/assets/js/emo'

Swiper.use([Pagination])

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

    const { initTouchModal, closeModal } = useTouchClose()

    /**
     * Wrappers
     */
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

    /**
     * Slider
     */
    const slider = ref<any>(null)
    const sliderObj = ref<any>(null)
    const maxHeight = ref('550px')
    const { clearExpression } = useCalculator()

    function setTrnFormHeight () {
      const el = document.querySelector('.getHeight')
      const height = el.clientHeight

      store.commit('trnForm/setTrnFormHeight', height)
      maxHeight.value = `${height}px`

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const height = entry.contentRect.height
          store.commit('trnForm/setTrnFormHeight', height)
          maxHeight.value = `${height}px`
        }
      })
      observer.observe(el)
    }

    function init () {
      if (!sliderObj.value) {
        setTimeout(() => {
          sliderObj.value = new Swiper(slider.value, {
            init: false,
            observer: true,
            observeParents: true,
            slidesPerView: 1,
            autoHeight: true,
            initialSlide: 1,
            noSwipingClass: 'trnFormNoSwiping',
            shortSwipes: false,
            longSwipesRatio: 0.1,
            longSwipesMs: 60,
            pagination: {
              el: '.trnForm__pagination',
              clickable: true
            }
          })
          setTrnFormHeight()
          sliderObj.value.init()
          initTouchModal({
            ...toRefs(wrappers),
            onClose: () => store.dispatch('trnForm/closeTrnForm')
          })
        }, 10)
      }
    }

    /**
     * isShow
     */
    const { isShow } = toRefs(props)
    watch(isShow, (value) => {
      if (value) {
        init()
      }
      else {
        if (sliderObj.value) {
          sliderObj.value.slideTo(1, 0)
        }
        clearExpression()
      }
    }, { immediate: true })

    /**
     * Amounts
     */
    const amountType = computed(() => store.state.trnForm.values.amountType)
    const isTransfer = computed(() => store.state.trnForm.values.amountType === 2)

    /**
     * Click on category
     */
    function onCategoryClick (categoryId) {
      store.commit('trnForm/setTrnFormValues', { categoryId })
      sliderObj.value.slideTo(1, 300)
    }

    /**
     * Click on wallet
     */
    function onClickWallet (walletId) {
      store.commit('trnForm/setTrnFormValues', { walletId })
      sliderObj.value.slideTo(1, 300)
    }

    /**
     * Prepare values
     */
    function prepeareValues (): any {
      let normalizedValues

      const id = store.state.trnForm.values.trnId || generateId(dayjs().valueOf())
      const { getResult } = useCalculator()

      // Simple
      if (!isTransfer.value) {
        normalizedValues = {
          amount: getResult.value,
          amountFrom: getResult.value,
          amountTo: getResult.value,
          categoryId: store.state.trnForm.values.categoryId,
          date: dayjs(store.state.trnForm.values.date).valueOf(),
          description: store.state.trnForm.values.description || null,
          groups: store.state.trnForm.values.groups || null,
          type: Number(store.state.trnForm.values.amountType) || 0,
          walletId: store.state.trnForm.values.walletId
        }
      }

      // Transfer
      if (isTransfer.value) {
        normalizedValues = {
          amount: getResult.value,
          amountFrom: getResult.value,
          amountTo: getResult.value,
          categoryId: 'transfer',
          date: dayjs(store.state.trnForm.values.date).valueOf(),
          walletId: store.state.trnForm.values.walletFromId,
          walletFromId: store.state.trnForm.values.walletFromId,
          walletToId: store.state.trnForm.values.walletToId,
          type: 2,
          description: store.state.trnForm.values.description || null,
          groups: store.state.trnForm.values.groups || null
        }
      }

      return {
        id,
        values: normalizedValues
      }
    }

    /**
     * Submit form
     */
    function handleSubmitForm () {
      try {
        const { validate } = useTrnFormValidate()
        const { id, values } = prepeareValues()

        const validateStatus = validate({
          ...values,
          walletFrom: store.getters['wallets/getWalletWithId'](store.state.trnForm.values.walletFromId),
          walletTo: store.getters['wallets/getWalletWithId'](store.state.trnForm.values.walletToId)
        })

        if (validateStatus.error) {
          // this.$notify({
          //   type: 'error',
          //   title: validateStatus.error.title,
          //   text: validateStatus.error.text
          // })
          return
        }

        // this.$notify({
        //   type: 'success',
        //   text: 'Excellent transaction!',
        //   title: random(successEmo)
        // })

        store.dispatch('trns/addTrn', { id, values })
      }
      catch (e) {
        console.log(e)
      }
    }

    return {
      closeModal,

      ...toRefs(wrappers),

      maxHeight,
      slider,
      sliderObj,
      setTrnFormHeight,

      amountType,
      isTransfer,

      onCategoryClick,
      onClickWallet,

      handleSubmitForm
    }
  }
}
</script>

<template lang="pug">
Portal(to="modal")
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
        :style="{ maxHeight: maxHeight }"
        ref="wrap"
      )
        .trnForm__handler(
          ref="handler"
          @click="closeModal"
        )
        .trnForm__closure(@click="closeModal")
          svg(
            viewBox='0 0 24 24'
            fill='none'
            stroke='#000'
            stroke-linecap='round'
            stroke-linejoin='round'
            stroke-width='1.5'
          )
            path(d='M.75 23.249l22.5-22.5')
            path(d='M23.25 23.249L.75.749')

        //- Content
        .trnForm__scroll(ref="content")
          .trnForm__content
            .swiper-container(ref="slider")
              .swiper-wrapper
                .swiper-slide(:style="{ height: maxHeight }")
                  .scroll.waitForScrollSlider
                    div(style="paddingBottom: 16px")
                      div(style="padding: 20px 0 10px 0")
                        WalletsList3(
                          :activeItemId="$store.state.trnForm.values.walletId"
                          :limit="4"
                          :showBase="false"
                          ui="widget"
                          @onClick="onClickWallet"
                        )

                      div(style="padding: 0 0 10px 0")
                        CategoriesView(
                          :ids="$store.getters['categories/lastUsedCategoriesIdsByDate']"
                          :activeItemId="$store.state.trnForm.values.categoryId"
                          ui="_flat"
                          :noPaddingBottom="true"
                          @onClick="onCategoryClick"
                        )

                .swiper-slide.getHeight
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

                    .trnFormNoSwiping2(
                      v-if="$store.getters['categories/quickSelectorCategoriesIds'].length"
                      style="paddingBottom: 12px"
                    )
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
                    TrnFormTypes
                    TrnFormAmount
                    TrnFormCalendar
                    TrnFormCalculator(@onSubmit="handleSubmitForm")
                    TrnFormHeader
                    TrnFormHeaderTransfer(v-show="isTransfer")

                .swiper-slide(:style="{ height: maxHeight }")
                  TrnFormTrns(
                    v-if="sliderObj"
                    :slider="sliderObj"
                  )
        .trnForm__pagination

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

<style lang="stylus">
@import '~assets/stylus/variables'

.trnForm
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

  &__closure
    z-index 3
    cursor pointer
    position absolute
    top 4px
    right 4px
    display flex
    align-items center
    justify-content center
    width 40px
    height 40px
    border-radius 50%
    anim()

    +media-hover()
      background var(--c-blue-1)

    svg
      anim()
      width 12px
      height 12px
      stroke var(--c-font-4)

    +media-hover()
      svg
        width 18px
        height 18px
        stroke var(--c-font-1)

  &__title
    padding 0 $m8
    padding-top $m9
    padding-bottom $m7
    color var(--c-font-3)
    font-size 22px
    font-weight 700
    letter-spacing 1px
    text-align center
    fontFamilyNunito()

    @media $media-laptop
      padding-bottom $m7
      border-radius 16px

  &__pagination
    .swiper-pagination-bullet
      opacity 1
      width 6px
      height 6px
      margin 0 4px
      background var(--c-bg-9)
      border-radius 50%
      anim()

      &-active
        width 10px
        background var(--c-bg-10)
        border-radius 4px
</style>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

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

.scroll
  overflow hidden
  overflow-y auto
  height 100%
  scrollbar()

.trnForm
  &__overflow
    @media $media-phone
      position fixed
      top 0
      right 0
      width 100%
      height 100%
      anim()

  &__quickCats
    opacity .8
    padding-bottom $m7

    &:hover
      opacity 1

  &__wrap
    overflow hidden
    position relative
    background var(--color-bg-canvas)
    border-radius 16px 16px 0 0
    box-shadow 0 0 10px 5px var(--c-bg-1)

    &._anim
      anim(200ms)

    @media $media-laptop
      border 1px solid var(--c-bg-1)
      border-radius 16px

  &__scroll
    background var(--color-bg-canvas)

  &__pagination
    z-index 2
    position absolute
    left 50%
    bottom 0
    display flex
    align-items center
    justify-content center
    width auto
    padding $m5
    background alpha(#171717, .9)
    border-radius $m5
    backdrop-filter blur(12px)
    transform translateX(-50%)
</style>
