<script>
import Swiper from 'swiper'
import 'swiper/swiper-bundle.css'

export default {
  props: {
    direction: {
      type: String,
      default: 'horizontal'
    },
    autoHeight: {
      type: Boolean,
      default: false
    },
    slidesPerColumn: {
      type: Number,
      default: 1
    },
    slidesPerView: {
      type: Number,
      default: 1
    },
    loop: {
      type: Boolean,
      default: false
    },
    onSlideChange: {
      type: Function,
      default: () => {}
    },
    watchIndex: {
      type: Number,
      default: 0
    },
    slideTo: {
      type: Number,
      default: 0
    }
  },

  data () {
    return {
      swiper: null,
      options: {
        autoHeight: this.autoHeight,
        direction: this.direction,
        loop: this.loop,
        slidesPerColumn: this.slidesPerColumn,
        slidesPerView: this.slidesPerView,
        shortSwipes: false,
        longSwipesRatio: 0.1,
        longSwipesMs: 60,
        on: {
          slideChange: () => {
            if (this.onSlideChange) {
              if (this.swiper) {
                if (this.swiper.realIndex !== this.watchIndex) {
                  this.onSlideChange(this.swiper.realIndex)
                }
              }
            }
          }
        }
      }
    }
  },

  computed: {
    activeTab () {
      return this.$store.state.ui.activeTab
    },
    showCategories () {
      return this.$store.state.trnForm.modal.categories
    }
  },

  watch: {
    activeTab: 'updateSlider',
    showCategories: 'updateSlider',
    watchIndex (newIndex) {
      this.swiper.slideToLoop(newIndex, 0)
    },
    slideTo (newIndex) {
      this.swiper.slideToLoop(newIndex)
    }
  },

  mounted () {
    this.swiper = new Swiper(this.$el, this.options)
  },

  methods: {
    updateSlider (newValue, oldValue) {
      if (newValue) {
        this.swiper.update()
      }
    }
  }
}
</script>

<template lang="pug">
.swiper-container
  .swiper-wrapper
    slot
</template>
