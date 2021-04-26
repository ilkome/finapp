<script>
export default {
  name: 'TrnFormModalTrn',

  data () {
    return {
      showModalConfirm: false,
      showModalBudgets: false,
      showModalGroups: false
    }
  },
  computed: {
    trnId () {
      return this.$store.state.trnForm.showModalTrnId
    },
    trn () {
      return this.$store.state.trns.items[this.trnId]
    },
    category () {
      return this.$store.state.categories.items[this.$store.state.trns.items[this.trnId].categoryId]
    },
    wallet () {
      return this.$store.state.wallets.items[this.$store.state.trns.items[this.trnId].walletId]
    },
    budgets () {
      return this.$store.getters['budgets/budgets']
    },
    groups () {
      return this.$store.getters['groups/groups']
    }
  },

  methods: {
    handleSetFilterCategory (id) {
      this.$store.commit('trns/hideTrnModal')
      this.$store.dispatch('ui/setActiveTab', 'stat')
      this.$store.commit('filter/setFilterDateNow')
      this.$store.dispatch('filter/setFilterCategoryId', this.$store.state.trns.items[this.trnId].categoryId)
    },
    handleSetFilterWallet (id) {
      this.$store.commit('trns/hideTrnModal')
      this.$store.dispatch('ui/setActiveTab', 'stat')
      this.$store.commit('filter/setFilterDateNow')
      this.$store.dispatch('filter/setFilterWalletId', this.$store.state.trns.items[this.trnId].walletId)
    },
    handleDublicateTrn () {
      const trnId = this.trnId
      this.$store.commit('trns/hideTrnModal')
      this.$store.dispatch('trnForm/openTrnForm', { action: 'duplicate', trnId })
    },
    handleEditClick () {
      const trnId = this.trnId
      this.$store.commit('trns/hideTrnModal')
      this.$store.dispatch('trnForm/openTrnForm', { action: 'edit', trnId })
    },
    handleDeleteClick () {
      this.showModalConfirm = true
    },
    handleDeleteConfirm () {
      const trnId = this.trnId
      this.showModalConfirm = false
      this.$store.commit('trns/hideTrnModal')
      this.$store.commit('trns/setTrnModalId', null)
      setTimeout(() => {
        this.$store.dispatch('trns/deleteTrn', trnId)
      }, 100)
    },
    toogleAddToBudget (budgetId) {
      this.$store.dispatch('budgets/toogleAddToBudget', { budgetId, trnId: this.trnId })
      this.showModalBudgets = false
    },
    toogleAddToGroup (groupId) {
      this.$store.dispatch('groups/toogleAddToGroup', { groupId, trnId: this.trnId })
      this.showModalGroups = false
    }
  }
}
</script>

<template lang="pug">
TrnFormModal.doNotCloseTrnModal(
  v-if="trnId"
  :show="$store.state.trnForm.modal.trn"
  :position="$store.state.ui.mobile ? 'bottom' : null"
  @onClose="$store.commit('trnForm/closeTrnFormModal', 'trn')"
)
  .modalLinks
    ModalButton(
      name="Delete"
      icon="mdi mdi-delete"
      @onClick="handleDeleteClick")

    ModalButton(
      name="Edit"
      icon="mdi mdi-pencil"
      @onClick="handleEditClick")

    ModalButton(
      name="Dublicate"
      icon="mdi mdi-content-copy"
      @onClick="handleDublicateTrn")

  //- confirm
  ModalBottomConfirm(
    :show="showModalConfirm"
    @onClose="showModalConfirm = false"
    @onConfirm="handleDeleteConfirm")
</template>

<style lang="stylus">
@import "~assets/stylus/variables/margins"

.trnFormWalletsList
  .walletsList__toogle
    border-top 0
    padding-bottom 0
</style>
