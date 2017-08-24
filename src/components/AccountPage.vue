<template lang="pug">
.content
  .module
    .module-in
      h1.title
        .name(:class="`account${account.id}`")  {{ account.name }}
        .name {{ account.currency }}
        .sup {{ account.id }}

  .module._bg
    .module-in
      TrnsList(:trns="trnsList")
</template>


<script>
import { mapGetters } from 'vuex'
import TrnsList from './TrnsList.vue'

export default {

  computed: {
    ...mapGetters(['trns']),

    account() {
      if (+this.$route.params.id) {
        const account = this.$store.state.accounts.all.find(a => a.id === +this.$route.params.id)
        if (account) return account
        return false
      }
      return false
    },

    trnsList() {
      return this.trns.slice(0, 1000)
        .filter(trn => trn.accountId === this.account.id)
        .slice(0, 30)
    }
  },

  components: { TrnsList }
}
</script>
