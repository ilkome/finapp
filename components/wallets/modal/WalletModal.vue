<script>
import { db } from '~/services/firebaseConfig'

import ModalBottom from '~/components/modal/ModalBottom'
import ModalBottomConfirm from '~/components/modal/ModalBottomConfirm'
import ModalButton from '~/components/modal/ModalButton'
import WalletItem from '~/components/wallets/item/WalletItem'

export default {
  components: {
    ModalBottom,
    ModalBottomConfirm,
    ModalButton,
    WalletItem
  },

  data () {
    return {
      showModalConfirm: false
    }
  },

  computed: {
    deleteInfo () {
      if (this.trnsIds.length > 0) {
        return `It's also will delete ${this.trnsIds.length} trns in this wallet`
      }
      return null
    },
    walletId () {
      return this.$store.state.wallets.modal.id
    },
    trnsIds () {
      const trns = this.$store.state.trns.items
      const trnsIds = []
      for (const trnId in trns) {
        if (trns[trnId].walletId === this.walletId) { trnsIds.push(trnId) }
      }
      return trnsIds
    }
  },

  methods: {
    handleSetFilterWallet (id) {
      this.$store.commit('wallets/hideWalletModal')
      this.$store.dispatch('ui/setActiveTab', 'stat')
      this.$store.commit('filter/setFilterDateNow')
      this.$store.dispatch('filter/setFilterWalletId', this.walletId)
    },

    handleEditClick () {
      const walletId = this.walletId
      this.$store.commit('wallets/hideWalletModal')
      this.$store.commit('wallets/setWalletEditId', walletId)
      this.$store.dispatch('ui/setActiveTab', 'createWallet')
    },

    handleDeleteClick () {
      this.showModalConfirm = true
    },

    handleDeleteConfirm () {
      const trnsIds = this.trnsIds
      const uid = this.$store.state.user.user.uid
      const id = this.walletId

      this.showModalConfirm = false
      this.$store.commit('wallets/hideWalletModal')
      this.$store.commit('wallets/setWalletModalId', null)

      setTimeout(async () => {
        await this.$store.dispatch('trns/deleteTrnsByIds', trnsIds)
        db.ref(`users/${uid}/accounts/${id}`)
          .remove()
          .then(() => console.log('wallet deleted'))
      }, 200)
    }
  }
}
</script>

<template lang="pug">
ModalBottom(
  v-if="$store.state.wallets.modal.id"
  :show="$store.state.wallets.modal.show"
  v-on:onClose="$store.commit('wallets/hideWalletModal')"
  v-on:afterClose="$store.commit('wallets/setWalletModalId', null)")
  template(v-if="walletId")
    template(slot="header")
      WalletItem(:id="walletId")

    template(slot="description")
      template(v-if="$store.state.wallets.items[walletId].desc")
        div(style="padding-bottom:20px") {{ $store.state.wallets.items[walletId].desc }}

    template(slot="btns")
      ModalButton(
        :name="$lang.base.delete"
        icon="mdi mdi-delete"
        v-on:onClick="handleDeleteClick")
      ModalButton(
        :name="$lang.base.edit"
        icon="mdi mdi-pencil"
        v-on:onClick="handleEditClick")
      ModalButton(
        :name="$lang.base.filter"
        icon="mdi mdi-filter-outline"
        v-on:onClick="handleSetFilterWallet")

  ModalBottomConfirm(
    :show="showModalConfirm"
    :description="deleteInfo"
    v-on:onClose="showModalConfirm = false"
    v-on:onConfirm="handleDeleteConfirm")
</template>
