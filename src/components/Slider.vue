<template lang="pug">
.swiper-container
  .swiper-wrapper
    slot
</template>

<script>
import Swiper from 'swiper'

export default {
  props: {
    activeTab: {
      type: String
    },
    idsOfOpenedCategories: {
      type: Array
    }
  },

  data() {
    const vm = this
    return {
      swiper: null,
      options: {
        autoHeight: true,
        loop: false,
        spaceBetween: 40,
        on: {
          slideChangeTransitionStart() {
            switch (this.realIndex) {
              case 0:
                vm.$emit('onChangeSlide', 'expenses')
                break
              case 1:
                vm.$emit('onChangeSlide', 'incomes')
                break
              case 2:
                vm.$emit('onChangeSlide', 'history')
                break
              default:
                vm.$emit('onChangeSlide', 'expenses')
            }
          }
        }
      }
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.swiper = new Swiper(this.$el, this.options)
    })
  },

  computed: {
    leftBar() {
      return this.$store.state.leftBar.isShow
    }
  },

  watch: {
    activeTab() {
      this.$nextTick(() => {
        this.changeSlide()
      })
    },
    idsOfOpenedCategories() {
      this.$nextTick(() => {
        this.swiper.update()
      })
    },
    leftBar() {
      this.$nextTick(() => {
        // It's need for complite leftBar animation finish
        setTimeout(() => {
          this.swiper.update()
        }, 500)
      })
    }
  },

  methods: {
    changeSlide() {
      switch (this.activeTab) {
        case 'expenses':
          this.swiper.slideTo(0)
          break
        case 'incomes':
          this.swiper.slideTo(1)
          break
        case 'history':
          this.swiper.slideTo(2)
          break
        default:
          this.swiper.slideTo(0)
      }
    }
  }
}
</script>
