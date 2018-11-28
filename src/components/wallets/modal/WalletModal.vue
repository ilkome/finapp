<script>
import { db } from '@/firebase'

import ModalBottom from '@/components/modal/ModalBottom'
import ModalBottomConfirm from '@/components/modal/ModalBottomConfirm'
import ModalButton from '@/components/modal/ModalButton'
import WalletItem from '@/components/wallets/item/WalletItem'

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
    walletId () {
      return this.$store.state.wallets.modal.id
    }
  },

  methods: {
    handleSetFilterWallet (id) {
      this.$store.commit('hideWalletModal')
      this.$store.dispatch('setActiveTab', 'stat')
      this.$store.commit('setFilterDateNow')
      this.$store.dispatch('setFilterWalletId', this.walletId)
    },

    handleEditClick () {
      const walletId = this.walletId
      this.$store.commit('hideWalletModal')
      this.$store.commit('setWalletEditId', walletId)
      this.$store.dispatch('setActiveTab', 'createWallet')
    },

    handleDeleteClick () {
      const trns = this.$store.state.trns.items
      const id = this.walletId

      let isTrns = false
      for (const trnId in trns) {
        if (trns[trnId].accountId === id) {
          this.$notify({
            group: 'main',
            title: '👆',
            text: 'You can not delete wallet with trns'
          })
          isTrns = true
          break
        }
      }

      if (!isTrns) this.showModalConfirm = true
    },

    handleDeleteConfirm () {
      const uid = this.$store.state.user.user.uid
      const id = this.walletId

      this.showModalConfirm = false
      this.$store.commit('hideWalletModal')
      this.$store.commit('setWalletModalId', null)
      setTimeout(() => {
        db.ref(`users/${uid}/accounts/${id}`)
          .remove()
          .then(() => console.log('removed'))
      }, 100)
    }
  }
}
</script>

<template lang="pug">
ModalBottom(
  v-if="$store.state.wallets.modal.id"
  :show="$store.state.wallets.modal.show"
  v-on:onClose="$store.commit('hideWalletModal')"
  v-on:afterClose="$store.commit('setWalletModalId', null)"
)
  template(v-if="walletId")
    template(slot="header")
      WalletItem(:id="walletId")

    template(slot="btns")
      ModalButton(
        name="Delete"
        icon="mdi mdi-delete"
        v-on:onClick="handleDeleteClick"
      )
      ModalButton(
        name="Edit"
        icon="mdi mdi-pencil"
        v-on:onClick="handleEditClick"
      )
      ModalButton(
        name="Set filter"
        icon="mdi mdi-filter-outline"
        v-on:onClick="handleSetFilterWallet"
      )

  ModalBottomConfirm(
    :show="showModalConfirm"
    v-on:onClose="showModalConfirm = false"
    v-on:onConfirm="handleDeleteConfirm"
  )
</template>
