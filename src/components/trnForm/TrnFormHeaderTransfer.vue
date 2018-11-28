<script>
import Amount from '@/components/amount/Amount'
import Icon from '@/components/icon/Icon'

export default {
  components: {
    Amount,
    Icon
  },

  computed: {
    walletFromId () {
      return this.$store.state.trnForm.transfer.from || this.$store.getters.walletsSortedIds[0]
    },
    walletFrom () {
      return this.$store.state.wallets.items[this.walletFromId]
    },
    walletToId () {
      return this.$store.state.trnForm.transfer.to || this.$store.getters.walletsSortedIds[1]
    },
    walletTo () {
      return this.$store.state.wallets.items[this.walletToId]
    },
    showIcon () {
      for (const modal in this.$store.state.trnForm.modal) {
        if (this.$store.state.trnForm.modal[modal]) {
          return false
        }
      }
      return true
    }
  },

  created () {
    this.$store.commit('setTrnFormTransfer', {
      tranferType: 'from',
      walletId: this.walletFromId
    })
    this.$store.commit('setTrnFormTransfer', {
      tranferType: 'to',
      walletId: this.walletToId
    })
  }
}
</script>

<template lang="pug">
.trnFormHeader
  //- Wallet from
  template(v-if="walletFrom")
    .trnFormHeader__item(
      :style="{ background: walletFrom.color || $store.state.ui.defaultBgColor }"
      @click="$store.commit('toogleTrnFormModal', 'transferFrom')"
    )
      transition(name="slide")
        .trnFormHeader__icon(v-show="showIcon")
          Icon(
            :big="true"
            :color="walletFrom.color || $store.state.ui.defaultBgColor"
            :invert="true"
            icon="mdi mdi-credit-card-multiple"
          )
      div
        .trnFormHeader__name {{ walletFrom.name }}
        .trnFormHeader__total
          Amount(
            :value="$store.getters.walletsTotal[walletFromId].base"
            :currency="$store.state.currencies.base"
          )

  //- Wallet to
  template(v-if="walletTo")
    .trnFormHeader__item(
      :style="{ background: walletTo.color || $store.state.ui.defaultBgColor }"
      @click="$store.commit('toogleTrnFormModal', 'transferTo')"
    )
      transition(name="slide")
        .trnFormHeader__icon(v-show="showIcon")
          Icon(
            :big="true"
            :color="walletTo.color || $store.state.ui.defaultBgColor"
            :invert="true"
            icon="mdi mdi-credit-card-multiple"
          )
      div
        .trnFormHeader__name {{ walletTo.name }}
        .trnFormHeader__total
          Amount(
            :value="$store.getters.walletsTotal[walletToId].base"
            :currency="$store.state.currencies.base"
          )
</template>
