<script>
import { useContext } from '@nuxtjs/composition-api'
import useFilter from '~/modules/filter/useFilter'
import useCalculator from '~/components/trnForm/calculator/useCalculator'

export default {
  name: 'TrnModal',

  setup () {
    const { store } = useContext()
    const { setCategoryFilter, setWalletFilter } = useFilter()

    const closed = () => {
      store.commit('trns/hideTrnModal')
      store.commit('trns/setTrnModalId', null)
    }

    return {
      setCategoryFilter,
      setWalletFilter,

      closed
    }
  },

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
    handleSetFilterCategory () {
      this.setCategoryFilter(this.$store.state.trns.items[this.trnId].categoryId)
      this.$store.commit('filter/setFilterDateNow')
      this.$store.commit('trns/hideTrnModal')
      this.$store.commit('trns/setTrnModalId', null)
      this.$store.commit('stat/setCategoryModal', { id: null, type: null })
      this.$store.dispatch('ui/setActiveTab', 'stat')
    },
    handleSetFilterWallet () {
      this.setWalletFilter(this.$store.state.trns.items[this.trnId].walletId)
      this.$store.commit('trns/hideTrnModal')
      this.$store.commit('trns/setTrnModalId', null)
      this.$store.commit('filter/setFilterDateNow')
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
  key="trnsModal"
  v-if="$store.state.trns.modal.show"
  to="modal"
)
  LazyBaseBottomSheet(
    v-if="$store.state.trns.modal.show"
    key="trnsModal"
    @closed="closed()"
  )
    template(#handler="{ close }")
      .handler__close(@click="close")
        svg(
          viewBox='0 0 24 24'
          fill='none'
          stroke='#000'
          stroke-linecap='round'
          stroke-linejoin='round'
          stroke-width='3'
        )
          path(d='M.75 23.249l22.5-22.5')
          path(d='M23.25 23.249L.75.749')

    template(#header)
      .header
        .header__category
          TrnsItemTrnItem(
            :category="category"
            :trn="$store.state.trns.items[trnId]"
            :trnId="trnId"
            :wallet="wallet"
            ui="detailed"
          )

    template
      .content
        .tools
          .modalLinks
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

            ModalButton(
              :name="`${$t('base.setFilter')} ${category.name}`"
              @onClick="handleSetFilterCategory"
            )
              template(#icon)
                Icon(
                  :icon="category.icon"
                  :background="category.color || $store.state.ui.defaultBgColor"
                  round
                )

            ModalButton(
              :name="`${$t('base.setFilter')} ${wallet.name}`"
              @onClick="handleSetFilterWallet"
            )
              template(#icon)
                Icon(
                  :abbr="wallet.name"
                  :background="wallet.color"
                )

            ModalButton(
              v-if="groups && $store.getters['user/isTester']"
              :name="$t('groups.show')"
              icon="mdi mdi-folder-multiple-outline"
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
@import '~assets/stylus/variables'

.header
  flex-grow 1
  position relative
  display flex
  align-items center
  justify-content center
  padding $m7
  padding-bottom $m9
  color var(--c-font-2)
  fontFamilyNunito()
  background var(--c-bg-3)
  border-radius $m7 $m7 0 0

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

.content
  +media(600px)
    border-radius 0 0 $m7 $m7
  // padding-top $m6
  // padding-bottom $m6
  // background var(--c-bg-3)
</style>
