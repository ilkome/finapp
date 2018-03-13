<template lang="pug">
.app
  notifications(
    group="foo"
    :duration="3000"
    :width="$store.state.isMobile ? '289' : 289"
    :position="$store.state.isMobile ? 'top right' : 'bottom left'"
  )

  template(v-if="!$store.state.isPageLoaded")
    Loading

  template(v-if="$store.state.isPageLoaded")
    //- Need to login
    template(v-if="!user && !$store.state.loader")
      Login

    //- Ok, run App
    template(v-else)
      //- Loading
      template(v-if="$store.state.loader")
        transition(name="fade")
          Loading(:showName="false")

      Sidebar
      Dashboard

      //- Trn form
      TrnForm
      template(v-if="!$store.state.categories.create && !$store.state.categories.edit && !$store.state.accounts.create && !$store.state.accounts.edit")
        .trnFormToogle(
          v-shortkey="['alt', 'arrowright']",
          @shortkey="$store.commit('toogleTrnForm')",
          @click.prevent.stop="$store.commit('toogleTrnForm')",
          :class="{_active: $store.state.trnForm.isShow}"
        )
        .trnFormButton(
          @click.prevent.stop="$store.commit('toogleTrnForm')"
        ): .trnFormButton__icon: .mdi.mdi-plus

      CategoryListBar
      CategoryCreate

      //- Category: edit
      transition(name="slideToRight")
        CategoryEdit(v-if="$store.state.categories.edit")

      //- Account: create
      transition(name="slideToRight")
        AccountCreate(v-if="$store.state.accounts.create")

      //- Account: edit
      transition(name="slideToRight")
        AccountEdit(v-if="$store.state.accounts.edit")
</template>

<script>
import { mapGetters } from 'vuex'
import firebase from 'firebase'
import localforage from 'localforage'
import debounce from 'lodash/debounce'
import { app } from '@/store/firebase'
import Sidebar from './sidebar/Sidebar.vue'
import TrnForm from '@components/trnForm/TrnForm.vue'
import Login from '@components/login/Login.vue'
import Loading from '@components/loading/Loading.vue'
import Dashboard from '@components/DashboardPage.vue'
import CategoryListBar from '@components/categories/CategoryListBar.vue'
import CategoryCreate from '@components/categories/CategoryCreate.vue'
import CategoryEdit from '@components/categories/CategoryEdit.vue'
import AccountCreate from '@components/accounts/AccountCreate.vue'
import AccountEdit from '@components/accounts/AccountEdit.vue'

export default {
  components: { Loading, Login, Dashboard, Sidebar, TrnForm, CategoryListBar, CategoryCreate, CategoryEdit, AccountCreate, AccountEdit },

  computed: {
    ...mapGetters(['user'])
  },

  async mounted() {
    try {
      const addedOfflineTrns = await localforage.getItem('addedOfflineTrns')
      const updatedOfflineTrns = await localforage.getItem('updatedOfflineTrns')
      const deletedOfflineTrns = await localforage.getItem('deletedOfflineTrns')
      console.groupCollapsed('Offline trns')
      console.log('addedOfflineTrns', addedOfflineTrns)
      console.log('updatedOfflineTrns', updatedOfflineTrns)
      console.log('deletedOfflineTrns', deletedOfflineTrns)
      console.groupEnd()

      // Initialize the App from localStorage
      // -----------------------------------------------------------------------
      const localViews = await localforage.getItem('views')
      const localData = await localforage.getItem('data')
      const localTrns = await localforage.getItem('trns')
      const localUser = await localforage.getItem('user')

      if (localViews && localViews.mobileDashboardActiveTab) {
        this.$store.commit('setMobileDashboardActiveTab', localViews.mobileDashboardActiveTab)
      }

      if (localData &&
          localTrns && localTrns.length &&
          localUser && localUser.uid &&
          localData.accounts && localData.accounts.length &&
          localData.categories && localData.categories.length &&
          localData.rates) {
        this.$store.commit('signIn', localUser)
        this.$store.commit('setRates', localData.rates)
        this.$store.commit('setAccounts', localData.accounts)
        this.$store.commit('setCategories', localData.categories)
        this.$store.commit('setTrns', localTrns)

        console.groupCollapsed('Data from cache')
        console.log('User', localUser)
        console.log('Accounts', localData.accounts)
        console.log('Categories', localData.categories)
        console.log('Rates', localData.rates)
        console.log('Trns', localTrns)
        console.groupEnd()

        this.$store.commit('closeLoader')
        this.$store.commit('pageLoaded')
      }

      // Auth
      // -----------------------------------------------------------------------
      app.auth().onAuthStateChanged(async (user) => {
        if (user) {
          const db = firebase.database()
          const uid = user.uid
          const userRef = `users/${uid}`
          const formatedUser = {
            displayName: user.displayName,
            email: user.email,
            uid
          }
          this.$store.commit('signIn', formatedUser)
          console.log('User', formatedUser)

          // Get data from firebase and dispatch to store
          // -------------------------------------------------------------------
          db.ref(`${userRef}`).on('value', async (snapshot) => {
            const val = snapshot.val()

            if (val) {
              console.groupCollapsed('Data from firebase')
              console.log(val.categories)
              console.log(val.accounts)
              console.log(val.trns)
              console.groupEnd()

              await this.$store.dispatch('setRates')
              await this.$store.dispatch('setCategories', val)
              await this.$store.dispatch('setAccounts', val)
              await this.$store.dispatch('setTrns', val)

              // Save data from firebase to localStorage
              // -----------------------------------------------------------------
              await localforage.setItem('data', {
                accounts: this.$store.state.accounts.all,
                categories: this.$store.state.categories.all,
                rates: this.$store.state.rates.all
              })
              await localforage.setItem('trns', this.$store.state.trns.all)
              await localforage.setItem('user', formatedUser)
            }

            this.$store.commit('closeLoader')
            this.$store.commit('pageLoaded')
          }, (e) => {
            // Authed user but do not have permissions to firebase
            if (this.user) {
              this.$notify({
                group: 'foo',
                title: 'Access error',
                text: 'You do not have permissions to database',
                type: 'error',
                duration: 30000
              })
              this.$store.dispatch('signOut')
            }
          })
        } else {
          this.$store.commit('signIn', null)
          this.$store.commit('closeLoader')
          this.$store.commit('pageLoaded')
        }
      })

      // Add offline trns to firebase when connected
      // -----------------------------------------------------------------------
      let isConnected = false
      const connectionRef = firebase.database().ref('.info/connected')
      connectionRef.on('value', async snap => {
        isConnected = snap.val()
        this.$store.commit('setConnectionStatus', isConnected)
        if (isConnected) {
          const addedOfflineTrns = await localforage.getItem('addedOfflineTrns')
          for (const key in addedOfflineTrns) {
            await this.$store.dispatch('addTrn', addedOfflineTrns[key])
          }

          const updatedOfflineTrns = await localforage.getItem('updatedOfflineTrns')
          for (const key in updatedOfflineTrns) {
            await this.$store.dispatch('updateTrn', updatedOfflineTrns[key])
          }

          const deletedOfflineTrns = await localforage.getItem('deletedOfflineTrns')
          for (const key in deletedOfflineTrns) {
            await this.$store.dispatch('deleteTrn', deletedOfflineTrns[key])
          }
        }
      })

      this.$store.watch((state) => state.trnForm.isShow, this.toogleBodyOverflow)
      this.$store.watch((state) => state.showedLeftbar, this.toogleBodyOverflow)
      this.$store.watch((state) => state.categories.list, this.toogleBodyOverflow)
      this.$store.watch((state) => state.accounts.show, this.toogleBodyOverflow)

      this.$nextTick(() => {
        window.addEventListener('resize', debounce(this.checkAndSetMobileOrPCVersion, 300))
        this.checkAndSetMobileOrPCVersion()
      })

      document.addEventListener('keyup', (event) => {
        if (event.keyCode === 27) { // escape key
          this.$store.commit('toogleAccountList', 'hide')
          this.$store.commit('toogleCategoriesList', 'hide')
        }
      })
    } catch (error) {
      console.error(error)
      this.$notify({
        group: 'foo',
        title: 'Error',
        text: error.message,
        type: 'error',
        duration: 30000
      })
    }
  },

  methods: {
    checkAndSetMobileOrPCVersion(event) {
      if (document.documentElement.clientWidth >= 768) {
        this.$store.commit('setMobile', false)
        this.$store.commit('toogleLeftbar', 'show')
      } else {
        this.$store.commit('setMobile', true)
        this.$store.commit('toogleLeftbar', 'hide')
      }
    },
    toogleBodyOverflow() {
      if (this.$store.state.isMobile) {
        const body = document.querySelector('body')
        if (this.$store.state.trnForm.isShow || this.$store.state.showedLeftbar || this.$store.state.accounts.show || this.$store.state.categories.list) {
          body.style.overflow = 'hidden'
        } else {
          body.style.overflow = ''
        }
      }
    }
  }
}
</script>
