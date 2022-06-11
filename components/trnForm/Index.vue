<script setup lang="ts">
import Vue from 'vue'
import dayjs from 'dayjs'
import SwiperCore, { Pagination } from 'swiper'
import 'swiper/swiper-bundle.css'
import generateId from '~/utils/id'

import useCalculator from '~/components/trnForm/calculator/useCalculator'
import useTrnFormValidate from '~/components/trnForm/useTrnFormValidate'
import { random, successEmo } from '~/assets/js/emo'

const props = withDefaults(defineProps<{
  show: boolean
}>(), {
  show: true,
})

SwiperCore.use([Pagination])

const { $store } = useNuxtApp()

// Expense
const expenseWalletId = computed(() => {
  const expenseWalletId = $store.state.trnForm.values.expenseWalletId
  const walletFromId = $store.state.trnForm.values.walletFromId
  const firstWalletId = $store.getters['wallets/walletsSortedIds'][0]
  return expenseWalletId || walletFromId || firstWalletId
})
const expenseWallet = computed(() => $store.state.wallets.items[expenseWalletId.value])

// Income
const incomeWalletId = computed(() => {
  const incomeWalletId = $store.state.trnForm.values.incomeWalletId
  const walletToId = $store.state.trnForm.values.walletToId
  const secondWalletId = $store.getters['wallets/walletsSortedIds'][1]
  return incomeWalletId || walletToId || secondWalletId
})
const incomeWallet = computed(() => $store.state.wallets.items[incomeWalletId.value])

const isSameCurrency = computed(() => incomeWallet.value?.currency === expenseWallet.value?.currency)

/**
 * Slider
 */
const slider = ref<any>(null)
const sliderObj = ref<any>(null)
const maxHeight = ref('550px')
const { clearExpression } = useCalculator()

function setTrnFormHeight() {
  const el = document.querySelector('.getHeight')
  const height = el.clientHeight

  $store.commit('trnForm/setTrnFormHeight', height)
  maxHeight.value = `${height}px`

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const height = entry.contentRect.height
      $store.commit('trnForm/setTrnFormHeight', height)
      maxHeight.value = `${height}px`
    }
  })
  observer.observe(el)
}

function init() {
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
        clickable: true,
      },
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
const isTransfer = computed(() => $store.state.trnForm.values.amountType === 2)

/**
 * Click on category
 */
function onCategoryClick(categoryId) {
  $store.commit('trnForm/setTrnFormValues', { categoryId })
}

/**
 * Click on wallet
 */
function onClickWallet(walletId) {
  $store.commit('trnForm/setTrnFormValues', { walletId })
}

/**
 * Prepare values
 */
function prepareValues(): any {
  let normalizedValues

  const id = $store.state.trnForm.values.trnId || generateId(dayjs().valueOf())
  const { getResult } = useCalculator()

  // Simple
  if (!isTransfer.value) {
    normalizedValues = {
      amount: getResult.value,
      categoryId: $store.state.trnForm.values.categoryId,
      date: dayjs($store.state.trnForm.values.date).valueOf(),
      description: $store.state.trnForm.values.description || null,
      groups: $store.state.trnForm.values.groups || null,
      type: Number($store.state.trnForm.values.amountType) || 0,
      walletId: $store.state.trnForm.values.walletId,
    }
  }

  // Transfer
  if (isTransfer.value) {
    normalizedValues = {
      categoryId: 'transfer',
      date: dayjs($store.state.trnForm.values.date).valueOf(),
      type: 2,
      description: $store.state.trnForm.values.description || null,
      groups: $store.state.trnForm.values.groups || null,
      expenseAmount: isSameCurrency.value ? getResult.value : $store.state.trnForm.values.expenseAmount,
      expenseWalletId: $store.state.trnForm.values.expenseWalletId,
      incomeAmount: isSameCurrency.value ? getResult.value : $store.state.trnForm.values.incomeAmount,
      incomeWalletId: $store.state.trnForm.values.incomeWalletId,
    }
  }

  return {
    id,
    values: normalizedValues,
  }
}

/**
 * Submit form
 */
function handleSubmitForm() {
  try {
    const { validate } = useTrnFormValidate()
    const { id, values } = prepareValues()

    const validateStatus = validate(values)

    if (validateStatus.error) {
      Vue.notify({
        type: 'error',
        title: validateStatus.error.title,
        text: validateStatus.error.text,
      })
      return
    }

    // TODO: translate
    Vue.notify({
      type: 'success',
      text: 'Excellent transaction!',
      title: random(successEmo),
    })

    $store.dispatch('trns/addTrn', { id, values })
  }
  catch (e) {
    console.log(e)
  }
}
</script>

<template lang="pug">
.trnForm
  .swiper-container(ref="slider")
    .swiper-wrapper
      //- History
      .swiper-slide(:style="{ height: maxHeight }")
        TrnFormTrnsSlide(
          v-if="sliderObj"
          :slider="sliderObj"
        )

      //- Main
      .swiper-slide.getHeight
        .scroll.scrollerBlock(:style="{ maxHeight: `${$store.state.ui.height}px` }")
          .text-center.pt-2.text-sm.font-medium.text-xs
            template(v-if="$store.state.trnForm.values.trnId") {{ $t('trnForm.titleEditTrn') }}
            template(v-if="!$store.state.trnForm.values.trnId") {{ $t('trnForm.createTrn') }}

          TrnFormTypes
          TrnFormAmount(v-if="!isTransfer || isTransfer && isSameCurrency")

          TrnFormDate
          TrnFormCalculator(
            v-if="!isTransfer || isTransfer && isSameCurrency"
            @onSubmit="handleSubmitForm"
          )
          TrnFormSelected
          TrnFormSelectedTransfer(
            v-if="isTransfer"
            @onSubmit="handleSubmitForm"
          )

      //- Quick selector
      .swiper-slide(:style="{ height: maxHeight }")
        .scroll.scrollerBlock
          //- Wallets
          .pt-5.pb-7
            .px-3.pb-2.text-skin-item-base.text-sm.font-semibold.font-nunito(
              @click="$store.commit('trnForm/showTrnFormModal', 'wallets')"
            ) {{ $t('wallets.title') }}

            WalletsList(
              :limit="4"
              #default="{ walletsItemsLimited }"
            )
              .px-3.grid.gap-y-1.gap-x-1.3sm_grid-cols-2
                //- Wallet
                .cursor-pointer.relative.flex.items-center.py-2.px-3.rounded-md.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
                  v-for="(walletItem, walletId) in walletsItemsLimited"
                  :key="walletId"
                  :class="[{ 'cursor-default !bg-skin-item-main-active': $store.state.trnForm.values.walletId === walletId }]"
                  @click="onClickWallet(walletId)"
                )
                  .grow.flex-center.gap-x-3
                    //- Icon
                    .w-6.h-6.rounded-md.flex-center.text-skin-icon-base.text-xs.leading-none(
                      :style="{ background: walletItem.color }"
                      class="mt-[2px]"
                    ) {{ walletItem.name.substring(0, 2) }}

                    .grow
                      //- Name
                      .text-sm.text-skin-item-base {{ walletItem.name }}

                      //- Amount
                      .text-sm
                        Amount(
                          :amount="walletItem.amount"
                          :currencyCode="walletItem.currency"
                          :isShowBaseRate="false"
                          align="left"
                        )

          //- Favorite categories
          .pb-7(v-if="$store.getters['categories/favoriteCategoriesIds'].length > 0")
            .px-3.pb-2.text-skin-item-base.text-sm.font-semibold.font-nunito(
              @click="$store.commit('trnForm/showTrnFormModal', 'categories')"
            ) {{ $t('categories.favoriteTitle') }} {{ $t('categories.title') }}

            .px-3
              CategoriesList(
                v-if="sliderObj"
                :ids="$store.getters['categories/favoriteCategoriesIds']"
                :activeItemId="$store.state.trnForm.values.categoryId"
                :slider="sliderObj"
                class="!gap-x-1"
                @onClick="onCategoryClick"
              )

          //- Recent categories
          .pb-7(v-if="$store.getters['categories/recentCategoriesIds'].length > 0")
            .px-3.pb-2.text-skin-item-base.text-sm.font-semibold.font-nunito(
              @click="$store.commit('trnForm/showTrnFormModal', 'categories')"
            ) {{ $t('categories.lastUsedTitle') }} {{ $t('categories.title') }}

            .px-3
              CategoriesList(
                v-if="sliderObj"
                :ids="$store.getters['categories/recentCategoriesIds']"
                :activeItemId="$store.state.trnForm.values.categoryId"
                :slider="sliderObj"
                class="!gap-x-1"
                @onClick="onCategoryClick"
              )

  .trnForm__pagination

  //- Modals
  Portal(to="modal")
    TrnFormModals

    TrnFormModalCalendar(v-if="$store.state.trnForm.modal.calendar")
    TrnFormModalCats(v-if="$store.state.trnForm.modal.categories")
    TrnFormModalCatsChild(v-if="$store.state.trnForm.modal.categoriesChild")
    TrnFormModalDescription(v-if="$store.state.trnForm.modal.description")
</template>

<style lang="stylus">
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

    /.light &
      background var(--c-bg-3)

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
        border-radius 4px

        /.light &
          background var(--c-blue-1)
</style>

<style lang="stylus" scoped>
.trnForm
  overflow hidden
  width 100%
  height auto
  background var(--c-bg-3)
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
    background var(--c-bg-3)
    border-radius 16px 16px 0 0
    box-shadow 0 0 10px 5px var(--c-bg-1)

    &._anim
      anim(200ms)

  &__scroll
    background var(--c-bg-3)

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

.scroll
  overflow hidden
  overflow-y auto
  height 100%
  scrollbar()
</style>
