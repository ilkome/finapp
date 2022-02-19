<script>
import { removeData } from '~/services/firebaseHelpers'
import useFilter from '~/modules/filter/useFilter'

export default {
  setup() {
    const { $store } = useNuxtApp()
    const { setWalletFilter } = useFilter()

    const closed = () => {
      $store.commit('wallets/hideWalletsModalWalletModal')
      $store.commit('wallets/setWalletsModalWalletModalId', null)
    }

    const wallet = computed(() => {
      const id = $store.state.wallets.modal.id
      if (!id) return
      return {
        ...$store.state.wallets.items[id],
        total: $store.getters['wallets/walletsTotal'][id].base,
      }
    })

    return {
      setWalletFilter,
      closed,
      wallet,
    }
  },

  data() {
    return {
      showModalConfirm: false,
    }
  },

  computed: {
    deleteInfo() {
      if (this.trnsIds.length > 0)
        return `It's also will delete ${this.trnsIds.length} trns in this wallet`

      return null
    },
    walletId() {
      return this.$store.state.wallets.modal.id
    },
    trnsIds() {
      const trns = this.$store.state.trns.items
      const trnsIds = []
      for (const trnId in trns) {
        if (trns[trnId].walletId === this.walletId
          || trns[trnId].walletFromId === this.walletId
          || trns[trnId].walletToId === this.walletId)
          trnsIds.push(trnId)
      }

      return trnsIds
    },
  },

  methods: {
    handleSetFilterWallet() {
      this.setWalletFilter(this.walletId)
      this.$store.commit('filter/setFilterDateNow')

      this.$store.commit('wallets/hideWalletsModalWalletModal')
      this.$store.commit('wallets/setWalletsModalWalletModalId', null)

      this.$store.dispatch('ui/setActiveTabStat', 'details')
    },

    handleEditClick() {
      const walletId = this.walletId
      this.$store.commit('wallets/hideWalletsModalWalletModal')
      this.$store.commit('wallets/setWalletsModalWalletModalId', null)
      this.$store.commit('wallets/setWalletEditId', walletId)
      this.$store.dispatch('ui/setActiveTab', 'createWallet')
    },

    handleDeleteClick() {
      this.showModalConfirm = true
    },

    handleDeleteConfirm() {
      const trnsIds = this.trnsIds
      const uid = this.$store.state.user.user.uid
      const id = this.walletId

      this.showModalConfirm = false
      this.$store.commit('wallets/hideWalletsModalWalletModal')
      this.$store.commit('wallets/setWalletsModalWalletModalId', null)

      setTimeout(async() => {
        await this.$store.dispatch('trns/deleteTrnsByIds', trnsIds)
        removeData(`users/${uid}/accounts/${id}`)
          .then(() => console.log('wallet deleted'))
      }, 200)
    },
  },
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
        .shame1.rounded-t-2xl.pb-2
          .gap-4.items-center.justify-center.flex-col.flex(
            class="-translate-y-6 -mb-6"
          )
            .text-neutral-50.text-lg.leading-none.w-12.h-12.rounded-md.justify-center.items-center.flex(
              :style="{ background: wallet.color }"
            ) {{ wallet.name.substring(0, 2) }}

            .gap-y-1.flex-col.flex
              .text-center.text-lg.text-neutral-500(class="dark:text-neutral-400") {{ wallet.name }}

              Amount(
                alwaysShowSymbol
                :currency="wallet.currency"
                :showBase="showBase"
                :value="wallet.total"
                size="xl"
                vertical="center"
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
.shame1
  background var(--c-bg-3)

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
