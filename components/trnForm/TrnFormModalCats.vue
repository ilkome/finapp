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
        const initialSlide = this.$store.getters['categories/quickSelectorCategoriesIds'] && this.$store.getters['categories/quickSelectorCategoriesIds'].length > 0 ? 1 : 2
        this.$nextTick(() => {
          if (isShow && this.$refs.slider) {
            this.slider = new Swiper(this.$refs.slider, {
              slidesPerView: 1,
              autoHeight: false,
              initialSlide,
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
  v-if="$store.state.trnForm.modal.categories"
  :show="$store.state.trnForm.modal.categories"
  :title="$t('categories.name')"
  :position="$store.state.ui.mobile ? 'bottom' : null"
  noPadding
  @onClose="$store.commit('trnForm/toogleTrnFormModal', 'categories')"
)
  .bottomNav
    .switcher(v-if="slider")
      .switcher__item(
        :class="{ _active: slider.activeIndex === 0 }"
        @click="slider.slideTo(0)"
      ) {{ $t('categories.lastUsedTitle') }}
      .switcher__item(
        :class="{ _active: slider.activeIndex === 1 }"
        @click="slider.slideTo(1)"
      ) {{ $t('categories.favoriteTitle') }}
      .switcher__item(
        :class="{ _active: slider.activeIndex === 2 }"
        @click="slider.slideTo(2)"
      ) {{ $t('categories.allTitle') }}

  .swiper-container(ref="slider")
    .swiper-wrapper
      .swiper-slide
        .scrollBlock.waitForScroll(
          v-if="$store.getters['categories/lastUsedCategoriesIdsByDate'] && $store.getters['categories/lastUsedCategoriesIdsByDate'].length > 0"
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
          v-if="$store.getters['categories/quickSelectorCategoriesIds'] && $store.getters['categories/quickSelectorCategoriesIds'].length"
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
@import '~assets/stylus/variables'

$border = 1px

.scrollBlock
  overflow hidden
  overflow-y auto
  scrollbar()

.marginBottom
  margin-top 40px
  margin-bottom 36px

.bottomNav
  z-index 10
  position absolute
  top 50px
  left 0
  width 100%
  padding 0
  background var(--c-bg-4)

.switcher
  display flex
  align-items center
  padding 0 $m7

.switcher__item
  cursor pointer
  flex-grow 1
  padding $m6 $m7
  color var(--c-font-5)
  font-size 12px
  font-weight 500
  font-roboto()
  text-align center
  border-bottom $border solid var(--c-bg-2)

  &:active
    background var(--c-bg-5)
    border-radius $m6 $m6 0 0
    border-bottom $border solid var(--c-bg-2)

  &._active
    cursor default
    color var(--c-font-3)
    background none
    border-bottom $border solid var(--c-blue-1)
</style>
