<script>
import Swiper from 'swiper'
import 'swiper/swiper-bundle.css'

export default {
  data () {
    return {
      slider: null
    }
  },

  computed: {
    show () {
      return this.$store.state.trnForm.modal.categories
    },

    modalStyle () {
      return { height: `${this.$store.state.trnForm.height - 48}px` }
    }
  },

  watch: {
    show: {
      handler (isShow) {
        this.$nextTick(() => {
          if (this.slider) {
            this.slider.update()
          }
          else {
            this.slider = new Swiper(this.$refs.slider, {
              slidesPerView: 1,
              autoHeight: false,
              initialSlide: 1,
              shortSwipes: false,
              longSwipesRatio: 0.1,
              longSwipesMs: 60
            })
          }
        })
      },
      immediate: true
    }
  },

  methods: {
    handleCategoryClick (categoryId) {
      if (this.$store.getters['categories/getChildCategoriesIds'](categoryId).length > 0) {
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
TrnFormModal(
  :show="$store.state.trnForm.modal.categories"
  :title="$lang.categories.name"
  :position="$store.state.ui.mobile ? 'bottom' : null"
  noPadding
  @onClose="$store.commit('trnForm/toogleTrnFormModal', 'categories')"
)
  .bottomNav
    .switcher(v-if="slider")
      .switcher__item(
        :class="{ _active: slider.activeIndex === 0 }"
        @click="slider.slideTo(0)"
      ) Last used
      .switcher__item(
        :class="{ _active: slider.activeIndex === 1 }"
        @click="slider.slideTo(1)"
      ) Favorites
      .switcher__item(
        :class="{ _active: slider.activeIndex === 2 }"
        @click="slider.slideTo(2)"
      ) All

  .swiper-container(ref="slider")
    .swiper-wrapper

      .swiper-slide
        .scrollBlock.waitForScroll(
          v-if="$store.state.ui.lastUsedCatsInTrnForm === 'visible' && $store.getters['categories/lastUsedCategoriesIdsByDate'].length > 0"
          :style="modalStyle"
        )
          .marginBottom
            CategoriesView(
              :ids="$store.getters['categories/lastUsedCategoriesIdsByDate']"
              ui="_flat"
              :noPaddingBottom="true"
              @onClick="handleCategoryClick"
            )

      .swiper-slide
        .scrollBlock.waitForScroll(
          v-if="$store.getters['categories/quickSelectorCategoriesIds'].length"
          :style="modalStyle"
        )
          .marginBottom
            CategoriesView(
              :ids="$store.getters['categories/quickSelectorCategoriesIds']"
              ui="_flat"
              :noPaddingBottom="true"
              @onClick="handleCategoryClick"
            )

      .swiper-slide
        .scrollBlock.waitForScroll(:style="modalStyle")
          .marginBottom
            CategoriesView(
              :ids="$store.getters['categories/categoriesRootIds']"
              :noPaddingBottom="true"
              @onClick="handleCategoryClick"
            )
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"
@import "~assets/stylus/variables/scroll"

.scrollBlock
  overflow hidden
  overflow-y auto
  scrollbar()

.marginBottom
  margin-bottom 80px

.bottomNav
  z-index 10
  position absolute
  left 0
  bottom 0
  width 100%
  padding 0

.switcher
  overflow hidden
  opacity .96
  position relative
  display flex
  align-items stretch
  justify-content stretch
  background var(--c-bg-4)

  &__item
    opacity .6
    flex-grow 1
    display flex
    align-items center
    justify-content center
    min-width 48px
    padding $m7 $m7
    font-size 14px
    border-radius 4px

    +media-hover()
      background var(--c-bg-3)

    &._active
      opacity 1
      background var(--c-bg-8)
</style>
