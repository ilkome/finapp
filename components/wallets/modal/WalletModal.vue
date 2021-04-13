<script>
import { db } from '~/services/firebaseConfig'

export default {
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
    handleSetFilterWallet () {
      this.$store.commit('wallets/hideWalletsModalWalletModal')
      this.$store.dispatch('ui/setActiveTab', 'stat')
      this.$store.commit('filter/setFilterDateNow')
      this.$store.dispatch('filter/setFilterWalletId', this.walletId)
      this.$store.commit('wallets/setWalletsModalWalletModalId', null)

      if (this.$store.state.ui.mobile) {
        this.$store.dispatch('ui/setActiveTabViewName', 'stat')
        this.$store.dispatch('ui/setActiveTabStat', 'details')
      }
    },

    handleEditClick () {
      const walletId = this.walletId
      this.$store.commit('wallets/hideWalletsModalWalletModal')
      this.$store.commit('wallets/setWalletsModalWalletModalId', null)
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
      this.$store.commit('wallets/hideWalletsModalWalletModal')
      this.$store.commit('wallets/setWalletsModalWalletModalId', null)

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
Portal(
  v-if="$store.state.wallets.modal.show"
  to="modal"
)
  ModalBottom(
    @onClose="$store.commit('wallets/hideWalletsModalWalletModal')"
    @afterClose="$store.commit('wallets/setWalletsModalWalletModalId', null)"
  )
    template(v-if="walletId")
      template(slot="emptyHeader")
        WalletsItemWalletItem2(
          :id="walletId"
          vertical="center"
          size="xl"
        )

      template(slot="description")
        template(v-if="$store.state.wallets.items[walletId].desc")
          div(style="padding-bottom:20px") {{ $store.state.wallets.items[walletId].desc }}

      template(slot="btns")
        ModalButton(
          :name="$t('base.delete')"
          icon="mdi mdi-delete"
          @onClick="handleDeleteClick"
        )
        ModalButton(
          :name="$t('base.edit')"
          icon="mdi mdi-pencil"
          @onClick="handleEditClick"
        )
        ModalButton(
          :name="$t('base.filter')"
          icon="mdi mdi-filter-outline"
          @onClick="handleSetFilterWallet"
        )

  ModalBottomConfirm(
    :show="showModalConfirm"
    :description="deleteInfo"
    @onClose="showModalConfirm = false"
    @onConfirm="handleDeleteConfirm"
  )
</template>

<style lang="stylus">
@import "~assets/stylus/variables"

.modalBottom
  .walletItemGrid
    width 100%
    padding $m8
    padding-top 0
    padding-bottom $m6
    background var(--c-bg-4)
    border-bottom 0
    border-radius $m6 $m6 0 0

    &__name
      padding-bottom $m7
      color var(--c-font-2)
      font-size 22px
      text-align center
      fontFamilyNunito()

    &__line
      height 6px
      margin-right (- $m8)
      margin-bottom $m8
      margin-left (- $m8)
</style>>
