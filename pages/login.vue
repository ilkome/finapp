<script lang="ts">
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '~/services/firebase/api'

export default defineComponent({
  layout: 'login',

  setup() {
    const route = useRoute()
    const router = useRouter()

    const isLoading = ref(false)

    if (route.query?.loading)
      isLoading.value = true

    onMounted(() => {
      if (route.query?.loader) {
        isLoading.value = true
        const newRoute = { ...route }
        delete newRoute.query?.loader
        router.replace(newRoute)
      }

      setTimeout(() => isLoading.value = false, 10000)
    })

    return {
      isLoading,
    }
  },

  fetch({ store, redirect }) {
    if (store.state.user?.user)
      redirect('/')
  },

  methods: {
    // signInWithEmailLink() {
    //   const email = 'ilya.komichev@gmail.com'
    //   const actionCodeSettings = {
    //     // URL you want to redirect back to. The domain (www.example.com) for this
    //     // URL must be in the authorized domains list in the Firebase Console.
    //     url: 'https://finapp.ilko.me',
    //     handleCodeInApp: true,
    //     iOS: {
    //       bundleId: 'com.finapp.ilko.me.ios',
    //     },
    //     android: {
    //       packageName: 'com.finapp.ilko.me.android',
    //       installApp: true,
    //       minimumVersion: '12',
    //     },
    //     dynamicLinkDomain: 'finapp.ilko.me',
    //   }

    //   sendSignInLinkToEmail(auth, email, actionCodeSettings)
    //     .then(() => {
    //       window.localStorage.setItem('emailForSignIn', email)
    //     })
    //     .catch((error) => {
    //       const errorCode = error.code
    //       const errorMessage = error.message
    //       console.log(errorCode, errorMessage)
    //     })
    // },

    signInWithGoogle() {
      this.$router.push({ query: { loading: true } })
      this.isLoading = true

      const provider = new GoogleAuthProvider()
      signInWithPopup(auth, provider)
        .catch(e => this.notifyAboutError(e))
    },

    notifyAboutError(e) {
      this.$notify({
        duration: 6000,
        text: e.message,
        title: 'Error',
        type: 'error',
      })
      this.isLoading = false
    },
  },
})
</script>

<template lang="pug">
.grid.h-full.text-center(class="grid-rows-[auto,1fr,auto]")
  //- Top
  .max-w-xl.mx-auto.py-4.p-2.w-full.md_p-6
    .flex.justify-between
      LocaleSwitcher
      ThemeSwitcher

  //- Center
  .h-full.grid.items-center.gap-8.py-4.px-3.h-full.overflow-hidden.overflow-y-auto
    .flex.flex-col.items-center.justify-center.pb-10
      SharedAppName

      //- div(@click="signInWithEmailLink") signInWithEmailLink

      .flex.flex-col.items-center.px-3.py-8
        .loginButton.bg-blue3.hocus_bg-blue1.hocus_shadow(
          :class="[{ _loading: isLoading }]"
          @click.prevent="signInWithGoogle"
        )
          transition(name="fadeIn")
            .loginButton__spinier(v-if="isLoading"): SharedSpinier
          .loginButton__text.text-white {{ $t('loginWithGoogle') }}

  .p-4.md_p-6
    SharedCopyright
</template>

<style lang="stylus" scoped>
.tab
  overflow-x hidden
  overflow-y scroll
  position relative
  display grid
  grid-template-rows auto 1fr auto
  scrollbar()
  width 100%
  height 100%
  max-width 1000px
  margin 0 auto

  +media(600px)
    grid-template-rows auto auto auto

  &__content
    display flex
    align-items center
    justify-content center
    flex-flow column

.linkItem
  text-decoration none

  +media-hover()
    &:not(._active)
      cursor pointer

.loginButton
  overflow hidden
  cursor pointer
  position relative
  min-width 260px
  padding $m7 $mb1
  font-size 16px
  text-align center
  border-radius 36px
  anim()

  &._loading
    pointer-events none
    cursor default

  &__text
    anim()

    ^[0]._loading &
      opacity 0

  &__spinier
    position absolute
    top 0
    left 0
    display flex
    align-items center
    justify-content center
    width 100%
    height 100%
</style>
