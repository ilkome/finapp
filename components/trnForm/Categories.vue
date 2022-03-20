<script>
import Swiper from 'swiper'
import 'swiper/swiper-bundle.css'

export default {
  name: 'TrnFormCategories',

  data() {
    return {
      slider: null,
    }
  },

  mounted() {
    const initialSlide = 1

    this.slider = new Swiper(this.$refs.trnFormCategories, {
      observer: true,
      slidesPerView: 1,
      touchStartPreventDefault: false,
      autoHeight: false,
      initialSlide,
      shortSwipes: false,
      longSwipesRatio: 0.1,
      longSwipesMs: 60,
    })
  },

  methods: {
    handleCategoryClick(categoryId) {
      if (this.$store.getters['categories/isCategoryHasChildren'](categoryId)) {
        this.$store.commit('trnForm/setTrnFormModalCategoryId', categoryId)
        this.$store.commit('trnForm/showTrnFormModal', 'categoriesChild')
      }
      else {
        this.$emit('closeModal')
        this.$store.commit('trnForm/setTrnFormValues', { categoryId })
      }
    },
  },
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
            .py-4.px-3.text-center.text-skin-item-base.text-xl.font-nunito.font-semibold.bg-skin-layout-main.rounded-t-2xl
              | {{ $t('categories.lastUsedTitle') }} {{ $t('categories.title') }}
            .pb-1.px-3
              CategoriesList(
                :activeItemId="$store.state.trnForm.values.categoryId"
                :ids="$store.getters['categories/lastUsedCategoriesIdsByDate']"
                class="!gap-x-1"
                @onClick="handleCategoryClick"
              )

        .swiper-slide
          .scrollBlock.scrollerBlock
            .py-4.px-3.text-center.text-skin-item-base.text-xl.font-nunito.font-semibold.bg-skin-layout-main.rounded-t-2xl
              | {{ $t('categories.title') }}
            .pb-1.px-3
              CategoriesList(
                :activeItemId="$store.state.trnForm.values.categoryId"
                :ids="$store.getters['categories/categoriesRootIds']"
                class="!gap-x-1"
                @onClick="handleCategoryClick"
              )

        .swiper-slide
          .scrollBlock.scrollerBlock(
            v-if="$store.getters['categories/quickSelectorCategoriesIds'] && $store.getters['categories/quickSelectorCategoriesIds'].length"
          )
            .py-4.px-3.text-center.text-skin-item-base.text-xl.font-nunito.font-semibold.bg-skin-layout-main.rounded-t-2xl
              | {{ $t('categories.favoriteTitle') }} {{ $t('categories.title') }}
            .pb-1.px-3
              CategoriesList(
                :activeItemId="$store.state.trnForm.values.categoryId"
                :ids="$store.getters['categories/quickSelectorCategoriesIds']"
                class="!gap-x-1"
                @onClick="handleCategoryClick"
              )

  .py-2.px-3(v-if="slider")
    .overflow-hidden.flex.items-center.text-center.text-xs.rounded-md.bg-gray-50.dark_bg-dark4.dark_shadow
      .cursor-pointer.px-5.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
        :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': slider.activeIndex === 0 }"
        @click="slider.slideTo(0)"
      ) {{ $t('categories.lastUsedTitle') }}

      .cursor-pointer.px-5.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
        :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': slider.activeIndex === 1 }"
        @click="slider.slideTo(1)"
      ) {{ $t('categories.allTitle') }}

      .cursor-pointer.px-5.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
        :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': slider.activeIndex === 2 }"
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
</style>
