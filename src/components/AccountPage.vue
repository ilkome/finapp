<template lang="pug">
.content
  .module
    h1.title
      | Кошелек:
      .name(:class="`account${account.id}`")  {{ account.name }}
      .name {{ account.currency }}
      .sup {{ account.id }}

  .module._bg
    TrnsList(:trns="trnsList")
</template>


<script>
import TrnsList from './TrnsList.vue'

export default {
  computed: {
    account() {
      return this.$store.state.accounts.all.find(a => a.id === +this.$route.params.id)
    },

    trnsList() {
      return this.$store.state.trns.all
        .filter(t => t.accountId === this.account.id)
        .slice(0, 30)
    }
  },

  components: { TrnsList }
}
</script>
