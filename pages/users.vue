<script>
import { db } from '~/services/firebaseConfig'

export default {
  data () {
    return {
      users: null,
      usersUid: {
        wK0dbJDL8xTdfQiyTOhK5dx11nC2: 'ilkome',
        empty: 'Empty',
        nd9fycmgEfMiWKq6cBoui9pszjN2: 'Lesya',
        kXVGIN19Mhd7WZUeTtZRqUSo2aJ3: 'Jenya',
        '8WDRZqvN2AauTXAl4mGwAGyKbbr1': 'Senya',
        tDJ0Bozi9iXh51BWZXzPnE2SnrG3: 'Solves',
        GB5TxVedunVQuNIqBM4vPwndw9N2: 'Anya',
        Z44Qw7tRHVcBUhd6pTDZxW9oWok2: 'Dev',
        '9nFJjMSSPMfmTtp8mzaPRoxDDq82': 'Nadya'
      }
    }
  },

  mounted () {
    this.getUsers()
  },

  methods: {
    async getUsers () {
      const monthAgo = this.$day().subtract(2, 'month').valueOf()
      const firebaseItemsReq = await db.ref('users-info')
        .orderByChild('loginDate')
        .startAt(monthAgo)
        .limitToFirst(100)
        .once('value')

      const users = firebaseItemsReq.val() || null
      const sortedUsers = []
      if (users) {
        const uids = Object.keys(users)
          .sort((a, b) => {
            if (users[a].loginDate > users[b].loginDate) { return -1 }
            if (users[a].loginDate < users[b].loginDate) { return 1 }
            return 0
          })

        // uids
        for (const uid of uids) {
          sortedUsers.push({
            uid,
            ...users[uid]
          })
        }
      }
      this.users = sortedUsers
    },

    async getCustomUserData (userUid) {
      this.$store.commit('app/setAppStatus', 'loading')

      await this.$store.dispatch('user/setUser', {
        ...this.$store.state.user.user,
        uid: userUid
      })

      await this.$store.dispatch('currencies/initCurrencies', null, { root: true })
      await this.$store.dispatch('currencies/initCurrencies', null, { root: true })
      await this.$store.dispatch('categories/initCategories', null, { root: true })
      await this.$store.dispatch('wallets/initWallets', null, { root: true })
      await this.$store.dispatch('trns/initTrns', null, { root: true })
      await this.$store.dispatch('lang/initDbLang', null, { root: true })

      this.$router.push('/')
    },

    deleteUserOpened (version, uid) {
      if (window.confirm('?')) {
        db.ref(`users-info/${uid}/opensApp/${version}`).set(null)
        this.getUsers()
      }
    },

    deleteUserAction (action, uid) {
      if (window.confirm('?')) {
        db.ref(`users-info/${uid}/actions/${action}`).set(null)
        this.getUsers()
      }
    }
  },

  head () {
    return {
      title: 'Users'
    }
  }
}
</script>

<template lang="pug">
.pageFlow
  .pageHeader
    n-link.pageHeader__name(to="/" tag="div") Users

  template(v-if="$store.getters['user/isTester']")
    .items
      .item(
        v-for="(userName, userUid) in usersUid"
        @click="getCustomUserData(userUid)"
      ) {{ userName }}

    .pb_baseOneAndHalf
      Button(
        @click="getUsers"
        title="Update users"
      )

    .usersWrap
      .item(
        v-for="user in users"
      )
        .tags
          .tagItem._one(v-if="$day(user.creationDate).isSame(user.loginDate, 'day')") once
          .tagItem._one(v-if="$day(user.creationDate).isSame($day(), 'week')") new
          .tagItem._one(v-if="!$day(user.creationDate).isSame(user.loginDate, 'day')") {{ $day(user.loginDate).from(user.creationDate, true) }}

        h2(@click="getCustomUserData(user.uid)") {{ user.name }}
        .pb_base {{ user.uid }}
        .pb_base(v-if="user.theme")
          .item__info._noPad
            .item__title Theme
            .item__date {{ user.theme }}

        .div
          .item__info._noPad
            .item__title Last login
            .item__date {{ $day(user.loginDate).format('D MMMM YYYY HH:mm') }}

        .pb_base
          .item__info._noPad(v-if="user.creationDate")
            .item__title Creation
            .item__date {{ $day(user.creationDate).format('D MMMM YYYY HH:mm') }}

        .pb_base(v-if="user.opensApp")
          .item__info._noPad Opened
          .item__info._noPad(
            v-for="(date, version) in user.opensApp"
            @click="deleteUserOpened(version, user.uid)"
          )
            .item__title {{ version }}
            .item__date {{ $day(date).format('D MMMM YYYY HH:mm') }}

        .pb_base(v-if="user.actions")
          .item__info._noPad Actions
          .item__info._noPad(
            v-for="(action, date) in user.actions"
            @click="deleteUserAction(date, user.uid)"
          )
            .item__title {{ action }}
            .item__date {{ $day(date).format('D MMMM YYYY HH:mm') }}

        .item__links
          a.item__link(
            :href="`https://finapp-17474.firebaseio.com/users/${user.uid}`"
            target="_blank"
          ) User Data

          a.item__link(
            :href="`https://finapp-17474.firebaseio.com/users-info/${user.uid}`"
            target="_blank"
          ) User Info
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/fonts"
@import "~assets/stylus/variables/media"
@import "~assets/stylus/variables/scroll"

.pb_base
  padding-bottom 12px

.tags
  position absolute
  top 16px
  right 16px
  display flex
  align-items center
  justify-content center

.tagItem
  margin-left 16px

.pageFlow
  overflowScrollY()
  display grid
  height 100%
  padding 16px
  padding-bottom 0

  +media-tablet()
    padding 32px

.pageHeader
  position relative
  display flex
  align-items center
  justify-content center
  margin-bottom 32px

  &__name
    fontFamilyNunito()
    font-size 2em
    font-weight bold

.usersWrap
.items
  display grid
  grid-template-columns repeat(auto-fill, minmax(300px, 1fr))
  grid-column-gap 16px
  grid-row-gap 16px
  padding-bottom 32px
  color var(--c-font-2)

.items
  display grid
  grid-template-columns repeat(auto-fill, minmax(100px, 1fr))
  grid-column-gap 16px
  grid-row-gap 16px

  .item
    margin 0
    text-align center

    &:first-letter
      color var(--blue1)

.item
  width 100%
  flex-grow 1
  position relative
  padding 16px
  background var(--c-bg-3)
  border-radius 8px

  h2
    font-size 24px
    padding-bottom 24px
    padding-right 40px
    fontFamilyNunito()
    text-transform none

    &:first-letter
      color #0094FF

  &__info
    display flex
    align-items center
    padding-bottom 8px

    &._noPad
      padding-bottom 0

  &__icon
    padding-right 8px

  &__title
    opacity .6
    padding-right 8px

  &__links
    display flex

  &__link
    display inline-block
    padding 16px 16px
    color var(--c-font-3)
    font-size 14px
    margin-right 16px
    border-radius 4px
</style>
