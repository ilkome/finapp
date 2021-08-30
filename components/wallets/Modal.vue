<script>
import { useContext } from '@nuxtjs/composition-api'
import { removeData } from '~/services/firebaseHelpers'
import useFilter from '~/modules/filter/useFilter'

export default {
  setup () {
    const { store } = useContext()
    const { setWalletFilter } = useFilter()

    const closed = () => {
      store.commit('wallets/hideWalletsModalWalletModal')
      store.commit('wallets/setWalletsModalWalletModalId', null)
    }

    return {
      setWalletFilter,
      closed
    }
  },

  data () {
    return {
      showModalConfirm: false
    }
  },

  computed: {
    deleteInfo () {
      if (this.trnsIds.length > 0)
        return `It's also will delete ${this.trnsIds.length} trns in this wallet`

      return null
    },
    walletId () {
      return this.$store.state.wallets.modal.id
    },
    trnsIds () {
      const trns = this.$store.state.trns.items
      const trnsIds = []
      for (const trnId in trns) {
        if (trns[trnId].walletId === this.walletId ||
          trns[trnId].walletFromId === this.walletId ||
          trns[trnId].walletToId === this.walletId)
          trnsIds.push(trnId)
      }

      return trnsIds
    }
  },

  methods: {
    handleSetFilterWallet () {
      this.setWalletFilter(this.walletId)
      this.$store.commit('filter/setFilterDateNow')

      this.$store.commit('wallets/hideWalletsModalWalletModal')
      this.$store.commit('wallets/setWalletsModalWalletModalId', null)

      this.$store.dispatch('ui/setActiveTabStat', 'details')
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
        removeData(`users/${uid}/accounts/${id}`)
          .then(() => console.log('wallet deleted'))
      }, 200)
    }
  }
}
</script>

<template lang="pug">
Portal(
  v-if="$store.state.wallets.modal.show"
  key="walletsModal"
  to="modal"
)
  LazyBaseBottomSheet(
    v-if="$store.state.wallets.modal.id"
    @closed="closed()"
  )
    template(#handler="{ close }")
      BaseBottomSheetClose(@onClick="close")

    template(#header)
      template(v-if="walletId")
        .walletWrap
          WalletsItemWalletItem2(
            :id="walletId"
            vertical="center"
            size="xl"
          )

    template(#default="{ close }")
      .content
        template(v-if="$store.state.wallets.items[walletId].desc")
          .info(style="padding-bottom:20px") {{ $store.state.wallets.items[walletId].desc }}

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
            :name="$t('base.filter')"
            icon="mdi mdi-filter-outline"
            @onClick="handleSetFilterWallet"
          )

        .buttonBack(
          @click="close()"
        ) {{ $t('close') }}

  ModalBottomConfirm(
    :show="showModalConfirm"
    :description="deleteInfo"
    @onClose="showModalConfirm = false"
    @onConfirm="handleDeleteConfirm"
  )
</template>

<style lang="stylus">
@import '~assets/stylus/variables'

.container
  .walletWrap
    padding-bottom $m8
    background var(--c-bg-3)

    .walletItemGrid
      cursor default
      width 100%
      padding $m8
      padding-top 0
      padding-bottom $m6
      border-bottom 0
      background var(--c-bg-3) !important
      border 1px solid transparent !important
      border-radius $m6 $m6 0 0

      &__name
        padding-bottom $m9
        color var(--c-font-2)
        font-size 22px
        text-align center
        fontFamilyNunito()

      &__line
        height 6px
        margin-right (- $m8)
        margin-bottom $m8
        margin-left (- $m8)
</style>

<style lang="stylus">
@import '~assets/stylus/variables'

.content
  padding-top $m6
  padding-bottom $m6
  background var(--c-bg-3)
  +media(600px)
    border-radius 0 0 $m7 $m7

.handler
  z-index 2
  position absolute
  top 0
  left 0
  display flex
  align-items center
  justify-content center
  width 100%
  height 16px

.buttonBack
  button-base-1()
  margin $m8 auto $m5 auto
</style>
