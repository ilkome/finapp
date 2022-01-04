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
            .pb-4
              CategoriesView(
                :activeItemId="$store.state.trnForm.values.categoryId"
                :ids="$store.getters['categories/lastUsedCategoriesIdsByDate']"
                :noPaddingBottom="true"
                @onClick="handleCategoryClick"
              )

        .swiper-slide
          .scrollBlock.scrollerBlock
            .header {{ $t('categories.title') }}
            .pb-4
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
            .pb-4
              CategoriesView(
                :activeItemId="$store.state.trnForm.values.categoryId"
                :ids="$store.getters['categories/quickSelectorCategoriesIds']"
                :noPaddingBottom="true"
                @onClick="handleCategoryClick"
              )

  .pt-2.pb-0.px-3.justify-center.flex(v-if="slider")
    .overflow-hidden.bg-4.rounded-md.justify-center.items-center.flex
      .barItem.px-6.py-3.font5(
        :class="{ _active: slider.activeIndex === 0 }"
        @click="slider.slideTo(0)"
      ) {{ $t('categories.lastUsedTitle') }}

      .barItem.px-6.py-3.font5(
        :class="{ _active: slider.activeIndex === 1 }"
        @click="slider.slideTo(1)"
      ) {{ $t('categories.allTitle') }}

      .barItem.px-6.py-3.font5(
        :class="{ _active: slider.activeIndex === 2 }"
        @click="slider.slideTo(2)"
      ) {{ $t('categories.favoriteTitle') }}
</template>

<style lang="stylus" scoped>
.contentWrap
  overflow hidden
  position relative
  display grid
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
