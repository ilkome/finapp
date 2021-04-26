<script>
import Swiper from 'swiper'
import 'swiper/swiper-bundle.css'

export default {
  name: 'TrnFormCategories',

  props: {
    show: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      slider: null
    }
  },

  watch: {
    show: {
      handler (isShow) {
        const initialSlide = this.$store.getters['categories/quickSelectorCategoriesIds'] && this.$store.getters['categories/quickSelectorCategoriesIds'].length > 0 ? 1 : 2
        if (isShow && this.$refs.trnFormCategories) {
          if (!this.slider) {
            this.slider = new Swiper(this.$refs.trnFormCategories, {
              observer: true,
              slidesPerView: 1,
              autoHeight: false,
              initialSlide,
              shortSwipes: false,
              longSwipesRatio: 0.1,
              longSwipesMs: 60
            })
          }
          else {
            this.slider.update()
          }
        }
      },
      immediate: true
    }
  },

  methods: {
    handleCategoryClick (categoryId) {
      if (this.$store.getters['categories/isCategoryHasChildren'](categoryId)) {
        this.$store.commit('trnForm/setTrnFormModalCategoryId', categoryId)
        this.$store.commit('trnForm/showTrnFormModal', 'categoriesChild')
      }
      else {
        this.$store.commit('trnForm/closeTrnFormModal', 'categories')
        this.$store.commit('trnForm/closeTrnFormModal', 'categoriesChild')
        this.$store.commit('trnForm/setTrnFormValues', { categoryId })
      }
    }
  }
}
</script>

<template lang="pug">
.contentWrap
  .switcherList(v-if="slider")
    .menuItem(
      :class="{ _active: slider.activeIndex === 0 }"
      @click="slider.slideTo(0)"
    ) {{ $t('categories.lastUsedTitle') }}
    .menuItem(
      :class="{ _active: slider.activeIndex === 1 }"
      @click="slider.slideTo(1)"
    ) {{ $t('categories.allTitle') }}
    .menuItem(
      :class="{ _active: slider.activeIndex === 2 }"
      @click="slider.slideTo(2)"
    ) {{ $t('categories.favoriteTitle') }}

  .contentWrap__box
    .swiper-container(ref="trnFormCategories")
      .swiper-wrapper
        .swiper-slide
          .scrollBlock.waitForScrollSlider(
            v-if="$store.getters['categories/lastUsedCategoriesIdsByDate'] && $store.getters['categories/lastUsedCategoriesIdsByDate'].length > 0"
          )
            CategoriesView(
              :activeItemId="$store.state.trnForm.values.categoryId"
              :ids="$store.getters['categories/lastUsedCategoriesIdsByDate']"
              :noPaddingBottom="true"
              @onClick="handleCategoryClick"
              ui="_flat"
          )

        .swiper-slide
          .scrollBlock.waitForScrollSlider
            CategoriesView(
              :ids="$store.getters['categories/categoriesRootIds']"
              :noPaddingBottom="true"
              @onClick="handleCategoryClick"
            )

        .swiper-slide
          .scrollBlock.waitForScrollSlider(
            v-if="$store.getters['categories/quickSelectorCategoriesIds'] && $store.getters['categories/quickSelectorCategoriesIds'].length"
          )
            CategoriesView(
              :activeItemId="$store.state.trnForm.values.categoryId"
              :ids="$store.getters['categories/quickSelectorCategoriesIds']"
              :noPaddingBottom="true"
              @onClick="handleCategoryClick"
              ui="_flat"
            )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.contentWrap
  overflow hidden
  position relative
  display grid
  grid-template-rows auto 1fr

  &__box
    overflow hidden
    height 100%

  .swiper-container
  .swiper-container .swiper-slide
    height 100%

.scrollBlock
  overflow hidden
  overflowScrollY()
  height 100%
  padding-top $m6
  padding-bottom $m8

.switcherList
  display flex
  justify-content center
  padding $m6

.menuItem
  cursor pointer
  margin 0 $m5
  padding $m6 $m8
  color var(--c-font-5)
  font-size 12px
  font-weight 500
  font-roboto()
  text-align center
  border 1px solid transparent
  border-radius 50px

  &:active
    color var(--c-font-2)
    background var(--c-blue-1)

  &._active
    cursor default
    color var(--c-font-3)
    background var(--c-bg-5)
    border 1px solid var(--c-bg-5)
</style>
