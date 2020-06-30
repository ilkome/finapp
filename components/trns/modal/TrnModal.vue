<script>
import Amount from '~/components/amount/Amount'
import ModalBottom from '~/components/modal/ModalBottom'
import ModalBottomConfirm from '~/components/modal/ModalBottomConfirm'
import ModalButton from '~/components/modal/ModalButton'
import TrnItem from '~/components/trns/item/TrnItem'
import Button from '~/components/shared/button/Button'

export default {
  components: {
    Amount,
    Button,
    ModalBottom,
    ModalBottomConfirm,
    ModalButton,
    TrnItem
  },

  data () {
    return {
      showModalConfirm: false,
      showModalBudgets: false,
      showModalGroups: false
    }
  },

  computed: {
    trnId () {
      return this.$store.state.trns.modal.id
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
ModalBottom(
  v-if="$store.getters['trns/hasTrns']"
  :show="$store.state.trns.modal.show"
  v-on:onClose="$store.commit('trns/hideTrnModal')"
  v-on:afterClose="$store.commit('trns/setTrnModalId', null)")

  template(v-if="trnId")
    template(slot="header")
      //- trn
      TrnItem(
        :category="category"
        :trn="$store.state.trns.items[trnId]"
        :trnId="trnId"
        :wallet="wallet"
        ui="detailed")

    //- btns
    template(slot="btns")
      ModalButton(
        name="Delete"
        icon="mdi mdi-delete"
        v-on:onClick="handleDeleteClick")

      ModalButton(
        name="Edit"
        icon="mdi mdi-pencil"
        v-on:onClick="handleEditClick")

      ModalButton(
        name="Dublicate"
        icon="mdi mdi-content-copy"
        v-on:onClick="handleDublicateTrn")

    .moreActions
      Button.marginBottom(
        className="_grey"
        title="Set category filter"
        icon="mdi mdi-folder-star"
        v-on:onClick="handleSetFilterCategory")

      Button.marginBottom(
        :class="{ marginBottom: budgets }"
        className="_grey"
        title="Set wallet filter"
        icon="mdi mdi-credit-card-multiple"
        v-on:onClick="handleSetFilterWallet")

      Button(
        v-if="budgets && $store.getters['user/isTester']"
        :class="{ marginBottom: groups }"
        className="_grey"
        title="Show budgets"
        icon="mdi mdi-hand-saw"
        v-on:onClick="showModalBudgets = true")

      Button(
        v-if="groups && $store.getters['user/isTester']"
        className="_grey"
        title="Show groups"
        icon="mdi mdi-folder-multiple-outline"
        v-on:onClick="showModalGroups = true")

  //- budgets
  template(v-if="groups && $store.getters['user/isTester']")
    ModalBottom(
      :show="showModalBudgets"
      title="Budgets"
      v-on:onClose="showModalBudgets = false"
      paddingless
    )
      template(v-for="(budget, budgetId) in budgets")
        .item(@click="toogleAddToBudget(budgetId)")
          .item__active
            template(v-if="trn && trn.budgets && trn.budgets[budgetId]")
              .mdi.mdi-check
            template(v-else)
              .mdi.mdi-plus
          .item__name {{ budget.name }}
          .item__amount
            Amount(:currency="budget.currency" :value="budget.amount")

  template(v-if="groups && $store.getters['user/isTester']")
    ModalBottom(
      :show="showModalGroups"
      title="groups"
      v-on:onClose="showModalGroups = false"
      paddingless
    )
      template(v-for="(group, groupId) in groups")
        .item(@click="toogleAddToGroup(groupId)")
          .item__active
            template(v-if="trn && trn.groups && trn.groups[groupId]")
              .mdi.mdi-check
            template(v-else)
              .mdi.mdi-plus
          .item__name {{ group.name }}
          //- .item__amount
          //-   Amount(:currency="group.currency" :value="group.amount")

  //- confirm
  ModalBottomConfirm(
    :show="showModalConfirm"
    v-on:onClose="showModalConfirm = false"
    v-on:onConfirm="handleDeleteConfirm")
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/scroll"

.marginBottom
  margin-bottom $m7

.moreActions
  padding-top $m8

.item
  display flex
  width 100%
  flex-grow 1
  cursor pointer
  padding $m7 $m8
  border-bottom 1px solid var(--c-bg-6)

  &:last-child
    border-bottom 0

  &:hover
    background var(--c-bg-5)
    /.light-mode &
      background var(--c-bg-5)

  &__active
    flex-grow 0
    width 40px

  &__name
    flex-grow 1
</style>
