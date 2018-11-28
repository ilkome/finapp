<script>
import ModalBottom from '@/components/modal/ModalBottom'
import ModalBottomConfirm from '@/components/modal/ModalBottomConfirm'
import ModalButton from '@/components/modal/ModalButton'
import TrnItem from '@/components/trns/item/TrnItem'
import Button from '@/components/shared/button/Button'

export default {
  components: {
    Button,
    ModalBottom,
    ModalBottomConfirm,
    ModalButton,
    TrnItem
  },

  data () {
    return {
      showModalConfirm: false
    }
  },

  computed: {
    trnId () {
      return this.$store.state.trns.modal.id
    },
    category () {
      return this.$store.state.categories.items[this.$store.state.trns.items[this.trnId].categoryId]
    },
    wallet () {
      return this.$store.state.wallets.items[this.$store.state.trns.items[this.trnId].accountId]
    }
  },

  methods: {
    handleSetFilterCategory (id) {
      this.$store.commit('hideTrnModal')
      this.$store.dispatch('setActiveTab', 'stat')
      this.$store.commit('setFilterDateNow')
      this.$store.dispatch('setFilterCategoryId', this.$store.state.trns.items[this.trnId].categoryId)
    },
    handleSetFilterWallet (id) {
      this.$store.commit('hideTrnModal')
      this.$store.dispatch('setActiveTab', 'stat')
      this.$store.commit('setFilterDateNow')
      this.$store.dispatch('setFilterWalletId', this.$store.state.trns.items[this.trnId].accountId)
    },
    handleDublicateTrn () {
      const trnId = this.trnId
      this.$store.commit('hideTrnModal')
      this.$store.dispatch('openTrnForm', { action: 'duplicate', trnId })
    },
    handleEditClick () {
      const trnId = this.trnId
      this.$store.commit('hideTrnModal')
      this.$store.dispatch('openTrnForm', { action: 'edit', trnId })
    },
    handleDeleteClick () {
      this.showModalConfirm = true
    },
    handleDeleteConfirm () {
      const trnId = this.trnId
      this.showModalConfirm = false
      this.$store.commit('hideTrnModal')
      this.$store.commit('setTrnModalId', null)
      setTimeout(() => {
        this.$store.dispatch('deleteTrn', trnId)
      }, 100)
    }
  }
}
</script>

<template lang="pug">
ModalBottom(
  :show="$store.state.trns.modal.show"
  v-on:onClose="$store.commit('hideTrnModal')"
  v-on:afterClose="$store.commit('setTrnModalId', null)"
)
  template(v-if="trnId")
    template(slot="header")
      //- trn
      TrnItem.disable-hover(
        :category="category"
        :trnId="trnId"
        :trn="$store.state.trns.items[trnId]"
        :wallet="wallet"
        :fullInfo="true"
      )

    //- btns
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
        name="Dublicate"
        icon="mdi mdi-content-copy"
        v-on:onClick="handleDublicateTrn"
      )

    .actions-extra
      Button.margin(
        className="_grey"
        title="Set category filter"
        icon="mdi mdi-chart-bubble"
        v-on:onClick="handleSetFilterCategory"
      )
      Button(
        className="_grey"
        title="Set wallet filter"
        icon="mdi mdi-credit-card-multiple"
        v-on:onClick="handleSetFilterWallet"
      )

  //- confirm
  ModalBottomConfirm(
    :show="showModalConfirm"
    v-on:onClose="showModalConfirm = false"
    v-on:onConfirm="handleDeleteConfirm"
  )
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/scrollbar"

.disable-hover:hover
.disable-hover:active
  background 0

.margin
  margin-bottom $m7

.actions-extra
  padding-top $m8
</style>
