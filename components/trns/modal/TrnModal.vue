<script>
import useCalculator from '~/components/trnForm/calculator/useCalculator'

export default {
  name: 'TrnModal',

  data () {
    return {
      showModalConfirm: false,
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
    groups () {
      return this.$store.getters['groups/groups']
    }
  },

  methods: {
    handleSetFilterCategory (id) {
      this.$store.commit('filter/setFilterDateNow')
      this.$store.dispatch('filter/setFilterCategoryId', this.$store.state.trns.items[this.trnId].categoryId)
      this.$store.commit('trns/hideTrnModal')
      this.$store.commit('trns/setTrnModalId', null)
      this.$store.commit('stat/setCategoryModal', { id: null, type: null })
      this.$store.dispatch('ui/setActiveTab', 'stat')
    },
    handleSetFilterWallet (id) {
      this.$store.commit('filter/setFilterDateNow')
      this.$store.dispatch('filter/setFilterWalletId', this.$store.state.trns.items[this.trnId].walletId)
      this.$store.commit('trns/hideTrnModal')
      this.$store.commit('trns/setTrnModalId', null)
      this.$store.commit('stat/setCategoryModal', { id: null, type: null })
      this.$store.dispatch('ui/setActiveTab', 'stat')
    },
    handleDublicateTrn () {
      const trnId = this.trnId
      this.$store.dispatch('trnForm/openTrnForm', { action: 'duplicate', trnId })
      this.$store.commit('trns/hideTrnModal')
      this.$store.commit('trns/setTrnModalId', null)
      this.$store.commit('stat/setCategoryModal', { id: null, type: null })
    },
    handleEditClick () {
      const trn = this.trn
      const trnId = this.trnId
      this.$store.dispatch('trnForm/openTrnForm', { action: 'edit', trnId })
      this.$store.commit('trns/hideTrnModal')
      this.$store.commit('trns/setTrnModalId', null)
      this.$store.commit('stat/setCategoryModal', { id: null, type: null })

      const { setExpression } = useCalculator()
      setExpression(trn.amount)
    },
    handleDeleteClick () {
      this.showModalConfirm = true
    },
    handleDeleteConfirm () {
      const trnId = this.trnId
      setTimeout(() => { this.$store.dispatch('trns/deleteTrn', trnId) }, 100)

      this.showModalConfirm = false
      this.$store.commit('trns/hideTrnModal')
      this.$store.commit('trns/setTrnModalId', null)
    },
    toogleAddToGroup (groupId) {
      this.$store.dispatch('groups/toogleAddToGroup', { groupId, trnId: this.trnId })
      this.showModalGroups = false
    }
  }
}
</script>

<template lang="pug">
Portal(
  v-if="$store.getters['trns/hasTrns'] && $store.state.trns.modal.show"
  to="modal"
)
  ModalBottom(
    :key="trnId"
    @onClose="$store.commit('trns/hideTrnModal')"
    @afterClose="$store.commit('trns/setTrnModalId', null)"
  )
    template(v-if="trnId")
      template(slot="header")
        //- trn
        TrnsItemTrnItem(
          :category="category"
          :trn="$store.state.trns.items[trnId]"
          :trnId="trnId"
          :wallet="wallet"
          ui="detailed"
        )

      //- btns
      template(slot="btns")
        ModalButton(
          :name="$t('base.delete')"
          icon="mdi mdi-delete-empty-outline"
          @onClick="handleDeleteClick"
        )

        ModalButton(
          :name="$t('base.edit')"
          icon="mdi mdi-pencil-outline"
          @onClick="handleEditClick"
        )

        ModalButton(
          :name="$t('base.dublicate')"
          icon="mdi mdi-content-copy"
          @onClick="handleDublicateTrn"
        )

      .moreActions
        SharedButton.marginBottom(
          :title="`${$t('base.setFilter')} ${this.category.name}`"
          className="_borderBottom"
          icon="mdi mdi-folder-star"
          @onClick="handleSetFilterCategory"
        )

        SharedButton.marginBottom(
          :title="`${$t('base.setFilter')} ${this.wallet.name}`"
          className="_borderBottom"
          icon="mdi mdi-credit-card-multiple"
          @onClick="handleSetFilterWallet"
        )

        SharedButton(
          v-if="groups && $store.getters['user/isTester']"
          className="_borderBottom"
          icon="mdi mdi-folder-multiple-outline"
          :title="$t('groups.show')"
          @onClick="showModalGroups = true"
        )

    template(v-if="groups && $store.getters['user/isTester']")
      Portal(
        v-if="showModalGroups"
        to="modal"
      )
        ModalBottom(
          :title="$t('groups.name')"
          paddingless
          @onClose="showModalGroups = false"
        )
          template(v-for="(group, groupId) in groups")
            .item(@click="toogleAddToGroup(groupId)")
              .item__active
                template(v-if="trn && trn.groups && trn.groups[groupId]")
                  .mdi.mdi-check
                template(v-else)
                  .mdi.mdi-plus
              .item__name {{ group.name }}

    //- confirm
    ModalBottomConfirm(
      :show="showModalConfirm"
      @onClose="showModalConfirm = false"
      @onConfirm="handleDeleteConfirm"
    )
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/scroll"

.marginBottom
  margin-bottom $m7

.item
  cursor pointer
  display flex
  width 100%
  flex-grow 1
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
