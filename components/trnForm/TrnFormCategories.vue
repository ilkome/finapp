<script>
import Swiper from 'swiper'
import 'swiper/swiper-bundle.css'

export default {
  name: 'TrnFormCategories',

  data () {
    return {
      slider: null
    }
  },

  mounted () {
    const initialSlide = 1

    this.slider = new Swiper(this.$refs.trnFormCategories, {
      observer: true,
      slidesPerView: 1,
      touchStartPreventDefault: false,
      autoHeight: false,
      initialSlide,
      shortSwipes: false,
      longSwipesRatio: 0.1,
      longSwipesMs: 60
    })
  },

  methods: {
    handleCategoryClick (categoryId) {
      if (this.$store.getters['categories/isCategoryHasChildren'](categoryId)) {
        this.$store.commit('trnForm/setTrnFormModalCategoryId', categoryId)
        this.$store.commit('trnForm/showTrnFormModal', 'categoriesChild')
      }
      else {
        this.$emit('closeModal')
        this.$store.commit('trnForm/setTrnFormValues', { categoryId })
      }
    }
  }
}
</script>

<template lang="pug">
.contentWrap
  .contentWrap__box
    .swiper-container(ref="trnFormCategories")
      .swiper-wrapper
        .swiper-slide
          .scrollBlock.scrollerBlock(
            v-if="$store.getters['categories/lastUsedCategoriesIdsByDate'] && $store.getters['categories/lastUsedCategoriesIdsByDate'].length > 0"
          )
            .header {{ $t('categories.lastUsedTitle') }} {{ $t('categories.title') }}
            .pb_base
              CategoriesView(
                :activeItemId="$store.state.trnForm.values.categoryId"
                :ids="$store.getters['categories/lastUsedCategoriesIdsByDate']"
                :noPaddingBottom="true"
                @onClick="handleCategoryClick"
                ui="_flat"
              )

        .swiper-slide
          .scrollBlock.scrollerBlock
            .header {{ $t('categories.title') }}
            .pb_base
              CategoriesView(
                :ids="$store.getters['categories/categoriesRootIds']"
                :noPaddingBottom="true"
                @onClick="handleCategoryClick"
              )

        .swiper-slide
          .scrollBlock.scrollerBlock(
            v-if="$store.getters['categories/quickSelectorCategoriesIds'] && $store.getters['categories/quickSelectorCategoriesIds'].length"
          )
            .header {{ $t('categories.favoriteTitle') }} {{ $t('categories.title') }}
            .pb_base
              CategoriesView(
                :activeItemId="$store.state.trnForm.values.categoryId"
                :ids="$store.getters['categories/quickSelectorCategoriesIds']"
                :noPaddingBottom="true"
                @onClick="handleCategoryClick"
                ui="_flat"
              )

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
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.pb_base
  padding-bottom 16px

.contentWrap
  overflow hidden
  position relative
  display grid
  grid-template-rows auto
  height 100%

  &__box
    overflow hidden
    height 100%

  .swiper-container
  .swiper-container .swiper-slide
    height 100%

.scrollBlock
  overflow hidden
  display grid
  align-items flex-end
  overflowScrollY()
  width 100%
  height 100%

  +media-laptop()
    align-items center

.switcherList
  display flex
  align-items center
  justify-content center
  padding $m6
  padding-bottom 0

.menuItem
  cursor pointer
  margin 0 $m5
  padding $m6 $m8
  color var(--c-font-5)
  font-size 12px
  font-weight 500
  font-roboto()
  text-align center
  anim()

  +media-hover()
    color var(--c-font-2)
    background var(--c-bg-5)
    border-radius 50px

  &._active
    cursor default
    color var(--c-blue-1)

.header
  padding 40px 0
  padding-bottom 60px
  font-h1()
  font-size 22px
  font-weight 600
  text-align center

  +media-laptop()
    font-size 28px
</style>
