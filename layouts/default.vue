<script>
import debounce from '~/utils/debounce'
import isTouchDevice from '~/assets/js/isTouchDevice'

export default {
  name: 'DefaultLayout',

  data () {
    return {
      isTouchDevice: false
    }
  },

  computed: {
    layoutStyles () {
      return { height: `${this.$store.state.ui.height}px` }
    },

    isProduction () {
      return process.env.NODE_ENV === 'production'
    }
  },

  async mounted () {
    this.isTouchDevice = isTouchDevice()

    this.getPageDimensions()
    window.addEventListener('resize', debounce(this.getPageDimensions, 600))

    const workbox = await window.$workbox

    if (workbox) {
      workbox.addEventListener('installed', (event) => {
        // If we don't do this we'll be displaying the notification after the initial installation, which isn't perferred.
        if (event.isUpdate) {
          this.$notify({
            title: this.$t('app.update.title'),
            text: this.$t('app.update.text'),
            duration: 10000
          })
        }
      })
    }
  },

  methods: {
    getPageDimensions () {
      const width = document.documentElement.clientWidth
      const height = document.documentElement.clientHeight
      this.$store.dispatch('ui/setAppDimensions', { width, height })
    }
  }
}
</script>

<template lang="pug">
.finapp(
  :class="{ isNotTouchDevice: !isTouchDevice }"
  :style="layoutStyles"
)
  //- Loading
  template(v-if="!$store.state.app.status.ready")
    Loader

  //- Continue to app
  transition(name="fadeInSlow" appear)
    template(v-if="$store.state.app.status.ready")
      Nuxt

  //- Notifications
  Notifications(
    :position="$store.state.ui.mobile ? 'top center' : 'top left'"
    :width="$store.state.ui.mobile ? '94%' : '380px'"
    classes="notifications"
  )

  //- Modals
  PortalTarget(
    multiple
    name="modal"
  )

  LazyMetrica(v-if="isProduction")
</template>

<style lang="stylus">
@import '~assets/stylus/variables'

*
  box-sizing border-box
  -webkit-tap-highlight-color transparent

  &:focus
    outline 0

html
  font-size 16px
// overscroll-behavior-y contain

body
  overflow hidden
  // overscroll-behavior-y contain
  margin 0
  color var(--c-font-2)
  font-primary()
  font-size 14px
  line-height 1
  letter-spacing 0
  background var(--c-bg-1)
  user-select none
</style>

<style lang="stylus" scoped>
@import '~assets/stylus/index'

.finapp
  display flex
  flex-flow column
  min-width 320px
</style>
