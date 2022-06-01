<script lang="ts">
import useFilter from '~/components/filter/useFilter'
import useCalculator from '~/components/trnForm/calculator/useCalculator'
import useTrn from '~/components/trns/item/useTrn'

// TODO: useFilter
export default {
  setup() {
    const { $store } = useNuxtApp()
    const { setFilterCatsId, setFilterWalletsId } = useFilter()

    const closed = () => {
      $store.commit('trns/hideTrnModal')
      $store.commit('trns/setTrnModalId', null)
    }

    const { formatTrnItem } = useTrn()
    const trnItem = computed(() => formatTrnItem($store.state.trns.modal.id))

    return {
      trnItem,
      setFilterCatsId,
      setFilterWalletsId,
      closed,
    }
  },

  data() {
    return {
      showModalConfirm: false,
      showModalGroups: false,
    }
  },

  computed: {
    trnId() {
      return this.$store.state.trns.modal.id
    },

    category() {
      return this.$store.state.categories.items[this.$store.state.trns.items[this.trnId].categoryId]
    },

    wallet() {
      return this.$store.state.wallets.items[this.$store.state.trns.items[this.trnId].walletId]
    },
  },

  methods: {
    handleSetFilterCategory() {
      this.setFilterCatsId(this.$store.state.trns.items[this.trnId].categoryId)
      this.$store.commit('filter/setFilterDateNow')
      this.$store.commit('trns/hideTrnModal')
      this.$store.commit('trns/setTrnModalId', null)
      this.$store.dispatch('ui/setActiveTabStat', 'details')
    },

    handleSetFilterWallet() {
      this.setFilterWalletsId(this.$store.state.trns.items[this.trnId].walletId)
      this.$store.commit('trns/hideTrnModal')
      this.$store.commit('trns/setTrnModalId', null)
      this.$store.commit('filter/setFilterDateNow')
      this.$store.dispatch('ui/setActiveTabStat', 'details')
    },

    handleDuplicateTrn() {
      const trnId = this.trnId
      this.$store.dispatch('trnForm/openTrnForm', { action: 'duplicate', trnId })
      this.$store.commit('trns/hideTrnModal')
      this.$store.commit('trns/setTrnModalId', null)
    },

    handleEditClick() {
      const trn = this.trnItem
      const trnId = this.trnId
      this.$store.dispatch('trnForm/openTrnForm', { action: 'edit', trnId })
      this.$store.commit('trns/hideTrnModal')
      this.$store.commit('trns/setTrnModalId', null)

      const { setExpression } = useCalculator()
      setExpression(trn.type === 2 && trn.incomeAmount ? trn.incomeAmount : trn.amount)
    },

    handleDeleteClick() {
      this.showModalConfirm = true
    },

    handleDeleteConfirm() {
      const trnId = this.trnId
      setTimeout(() => { this.$store.dispatch('trns/deleteTrn', trnId) }, 100)

      this.showModalConfirm = false
      this.$store.commit('trns/hideTrnModal')
      this.$store.commit('trns/setTrnModalId', null)
    },
  },
}
</script>

<template lang="pug">
Portal(
  key="TrnsItemModal"
  v-if="$store.state.trns.modal.show"
  to="modal"
)
  LazyBaseBottomSheet(
    v-if="$store.state.trns.modal.show"
    key="TrnsItemModal"
    @closed="closed"
  )
    template(#handler="{ close }")
      BaseBottomSheetClose(@onClick="close")

    template(#header)
      .header
        .header__category
          TrnsItemDetails(
            :category="category"
            :trn="trnItem"
            :trnId="trnId"
            :wallet="wallet"
            ui="detailed"
          )

    template(#default="{ close }")
      .content.pb-4
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
              :name="$t('base.duplicate')"
              icon="mdi mdi-content-copy"
              @onClick="handleDuplicateTrn"
            )

            ModalButton(
              :name="`${$t('base.setFilter')} ${category.name}`"
              @onClick="handleSetFilterCategory"
            )
              template(#icon)
                Icon(
                  :icon="category.icon"
                  :background="category.color"
                  round
                )

            ModalButton(
              v-if="wallet"
              :name="`${$t('base.setFilter')} ${wallet.name}`"
              @onClick="handleSetFilterWallet"
            )
              template(#icon)
                Icon(
                  :abbr="wallet.name"
                  :background="wallet.color"
                )

        .pt-4.px-4.flex-center
          .cursor-pointer.grow.py-3.px-5.flex-center.rounded-full.text-sm.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
            class="basis-1/2 max-w-[280px]"
            @click="close()"
          ) {{ $t('close') }}

  //- delete confirm
  ModalBottomConfirm(
    :show="showModalConfirm"
    @onClose="showModalConfirm = false"
    @onConfirm="handleDeleteConfirm"
  )
</template>

<style lang="stylus" scoped>
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

.content
  background var(--c-bg-3)
  +media(600px)
    border-radius 0 0 $m7 $m7
</style>
