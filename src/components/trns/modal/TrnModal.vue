<script>
import Amount from '@/components/amount/Amount'
import ModalBottom from '@/components/modal/ModalBottom'
import ModalBottomConfirm from '@/components/modal/ModalBottomConfirm'
import ModalButton from '@/components/modal/ModalButton'
import TrnItem from '@/components/trns/item/TrnItem'
import Button from '@/components/shared/button/Button'

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
      return this.$store.state.wallets.items[this.$store.state.trns.items[this.trnId].accountId]
    },
    budgets () {
      return this.$store.getters.budgets
    },
    groups () {
      return this.$store.getters.groups
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
    },
    toogleAddToBudget (budgetId) {
      this.$store.dispatch('toogleAddToBudget', { budgetId, trnId: this.trnId })
      this.showModalBudgets = false
    },
    toogleAddToGroup (groupId) {
      this.$store.dispatch('toogleAddToGroup', { groupId, trnId: this.trnId })
      this.showModalGroups = false
    }
  }
}
</script>

<template lang="pug">
ModalBottom(
  :show="$store.state.trns.modal.show"
  v-on:onClose="$store.commit('hideTrnModal')"
  v-on:afterClose="$store.commit('setTrnModalId', null)")

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
        icon="mdi mdi-chart-bubble"
        v-on:onClick="handleSetFilterCategory")

      Button(
        :class="{ marginBottom: budgets }"
        className="_grey"
        title="Set wallet filter"
        icon="mdi mdi-credit-card-multiple"
        v-on:onClick="handleSetFilterWallet")

      Button(
        :class="{ marginBottom: groups }"
        className="_grey"
        title="Show budgets"
        icon="mdi mdi-hand-saw"
        v-on:onClick="showModalBudgets = true")

      Button(
        className="_grey"
        title="Show groups"
        icon="mdi mdi-folder-multiple-outline"
        v-on:onClick="showModalGroups = true")

  //- budgets
  template(v-if="budgets")
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

  template(v-if="groups")
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
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/scrollbar"

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
    /.theme-light &
      background var(--c-bg-5)

  &__active
    flex-grow 0
    width 40px

  &__name
    flex-grow 1
</style>
