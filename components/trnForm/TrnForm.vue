<script lang="ts">
import Vue from 'vue'
import dayjs from 'dayjs'
import SwiperCore, { Pagination } from 'swiper'
import 'swiper/swiper-bundle.css'
import { ref, computed, watch, onMounted, useContext } from '@nuxtjs/composition-api'
import generateId from '~/utils/id'

import useCalculator from '~/components/trnForm/calculator/useCalculator'
import useTrnFormValidate from '~/components/trnForm/useTrnFormValidate'
import { successEmo, random } from '~/assets/js/emo'

SwiperCore.use([Pagination])

export default {
  name: 'TrnForm',

  props: {
    show: { type: Boolean, default: true }
  },

  setup (props) {
    const { store } = useContext()
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
        sliderObj.value = new SwiperCore(slider.value, {
          init: false,
          observer: true,
          observeParents: true,
          slidesPerView: 1,
          touchStartPreventDefault: false,
          initialSlide: 1,
          shortSwipes: false,
          longSwipesRatio: 0.1,
          longSwipesMs: 60,
          pagination: {
            el: '.trnForm__pagination',
            clickable: false
          }
        })
        setTrnFormHeight()
        sliderObj.value.init()
      }
    }

    /**
     * isShow
     */
    onMounted(() => {
      init()
    })

    watch(() => props.show, (value) => {
      if (!value) {
        clearExpression()
        if (sliderObj.value)
          sliderObj.value.slideTo(1, 0)
      }
    })

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
      // sliderObj.value.slideTo(1, 300)
    }

    /**
     * Click on wallet
     */
    function onClickWallet (walletId) {
      store.commit('trnForm/setTrnFormValues', { walletId })
      // sliderObj.value.slideTo(1, 300)
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
          Vue.notify({
            type: 'error',
            title: validateStatus.error.title,
            text: validateStatus.error.text
          })
          return
        }

        Vue.notify({
          type: 'success',
          text: 'Excellent transaction!',
          title: random(successEmo)
        })

        store.dispatch('trns/addTrn', { id, values })
      }
      catch (e) {
        console.log(e)
      }
    }

    return {
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
.trnForm
  .swiper-container(ref="slider")
    .swiper-wrapper
      //- History
      .swiper-slide(:style="{ height: maxHeight }")
        TrnFormTrns(
          v-if="sliderObj"
          :slider="sliderObj"
        )

      //- Main
      .swiper-slide.getHeight
        .scroll.scrollerBlock(:style="{ maxHeight: `${$store.state.ui.height}px` }")
          .trnForm__title(v-if="$store.state.trnForm.values.trnId") {{ $t('trnForm.titleEditTrn') }}
          .trnForm__title(v-if="!$store.state.trnForm.values.trnId") {{ $t('trnForm.titleCreateTrn') }}

          TrnFormTypes
          TrnFormAmount
          TrnFormCalendar
          TrnFormCalculator(@onSubmit="handleSubmitForm")
          TrnFormHeader
          LazyTrnFormHeaderTransfer(v-if="isTransfer")

      //- Quick selector
      .swiper-slide(:style="{ height: maxHeight }")
        .scroll.scrollerBlock
          div(style="paddingBottom: 16px")
            //- Wallets
            div(style="padding: 20px 0 26px 0")
              WalletsList3(
                :activeItemId="$store.state.trnForm.values.walletId"
                :limit="4"
                :showBase="false"
                ui="widget"
                @onClick="onClickWallet"
              )

            //- Favorite categories
            div(style="padding: 0 0 26px 0")
              .subTitle {{ $t('categories.favoriteTitle') }} {{ $t('categories.title') }}
              CategoriesView(
                :ids="$store.getters['categories/quickSelectorCategoriesIds']"
                :activeItemId="$store.state.trnForm.values.categoryId"
                ui="_flat"
                :noPaddingBottom="true"
                @onClick="onCategoryClick"
              )

            //- Last used categories
            div(style="padding: 0 0 10px 0")
              .subTitle {{ $t('categories.lastUsedTitle') }} {{ $t('categories.title') }}
              CategoriesView(
                :ids="$store.getters['categories/lastUsedCategoriesIdsByDate']"
                :activeItemId="$store.state.trnForm.values.categoryId"
                ui="_flat"
                :noPaddingBottom="true"
                @onClick="onCategoryClick"
              )

          .buttons
            .button(@click="$store.commit('trnForm/showTrnFormModal', 'wallets')") {{ $t('wallets.title') }}
            .button(@click="$store.commit('trnForm/showTrnFormModal', 'categories')") {{ $t('categories.title') }}

  .trnForm__pagination

  //- Modals
  LazyTrnFormModalCalendar(v-if="$store.state.trnForm.modal.calendar")
  LazyTrnFormModalCats(v-if="$store.state.trnForm.modal.categories")
  LazyTrnFormModalCatsChild(v-if="$store.state.trnForm.modal.categoriesChild")
  LazyTrnFormModalWallets(v-if="$store.state.trnForm.modal.wallets")
  LazyTrnFormModalDescription(v-if="$store.state.trnForm.modal.description")
  LazyTrnFormModalTransferFrom(v-if="$store.state.trnForm.modal.transferFrom")
  LazyTrnFormModalTransferTo(v-if="$store.state.trnForm.modal.transferTo")
</template>

<style lang="stylus">
@import '~assets/stylus/variables'

.trnFormWalletsList .wallets__grid
.trnForm .wallets__grid
  grid-template-columns repeat(2, 1fr) !important
  grid-column-gap $m6 !important
  grid-row-gap $m6 !important

.trnForm
  &__pagination
    z-index 2
    position absolute
    left 50%
    bottom 1px
    display flex
    align-items center
    justify-content center
    width auto
    padding $m5
    background alpha(#171717, .9)
    border-radius $m5
    backdrop-filter blur(12px)
    transform translateX(-50%)

    /.light-mode &
      background var(--color-bg-canvas)

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

        /.light-mode &
          background var(--c-blue-1)
</style>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.trnForm
  overflow hidden
  overflow hidden
  width 100%
  height auto
  background var(--color-bg-canvas)
  border-radius $m8 $m8 0 0

  +media(600px)
    border-radius 16px

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

  &__scroll
    background var(--color-bg-canvas)

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

.buttons
  display flex
  align-items center
  justify-content center
  gap $m8
  padding 0 $m7
  padding-top $m4
  padding-bottom $m9

.button
  button-base-1()

.subTitle
  padding 0 $m8
  padding-bottom $m6
  color var(--c-font-4)
  font-size 10px
  letter-spacing 0px
  font-weight 600
  text-align center
  text-transform uppercase

.scroll
  overflow hidden
  overflow-y auto
  height 100%
  scrollbar()
</style>
