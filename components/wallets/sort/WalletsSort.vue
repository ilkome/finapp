<script>
import Draggable from 'vuedraggable'
import { random, successEmo } from '~/assets/js/emo'

export default {
  components: { Draggable },

  data() {
    return {
      sortedWalletsIds: this.$store.getters['wallets/walletsSortedIds'],
    }
  },

  methods: {
    /**
     * Get array of wallets IDs
     * Convert them to objects with order value
     * Push object with wallets to DB
     */
    async saveWalletsOrder() {
      const sortedWallets = {}

      for (const [idx, walletId] of this.sortedWalletsIds.entries())
        sortedWallets[walletId] = idx

      const result = await this.$store.dispatch('wallets/saveWalletsOrder', sortedWallets)
      if (result.succsess) {
        if (this.$listeners.closeModal) this.$listeners.closeModal()
        this.$notify({
          type: 'success',
          title: random(successEmo),
          text: 'Saved',
        })
      }
    },
  },
}
</script>

<template lang="pug">
.h-full.overflow.overflow-x-auto
  .mb-2.py-10.pt-12.px-3.text-center.text-neutral-800.dark_text-white.text-2xl.font-semibold.font-nunito
    | {{ $t('wallets.sortTitle') }}

  WalletsList2(
    :style="{ paddingTop: '10px' }"
    v-slot="{ wallets }")
    Draggable(
      v-model="sortedWalletsIds"
      handle=".handle"
      ghost-class="_draggable"
    )
      template(v-for="walletId in sortedWalletsIds")
        .walletItem2(:key="walletId")
          .walletItem2__icon.handle
            Icon(
              :abbr="$store.state.wallets.items[walletId].name"
              :background="$store.state.wallets.items[walletId].color || $store.state.ui.defaultBgColor")

          .walletItem2__name {{ $store.state.wallets.items[walletId].name }}
          .walletItem2__drag.handle.doNotCloseModal: .mdi.mdi-drag-horizontal-variant

  .col
    SharedButton(
      className="_blue2 _text-center"
      :title="$t('base.save')"
      @onClick="saveWalletsOrder"
    )
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables"

item-bg-active()
  background var(--c-bg-6)

item-main-text()
  color var(--c-font-4)
  fs-m()

item-icon()
  color var(--c-font-5)
  font-size 22px

  &:active
    item-bg-active()

.walletItem2
  display grid
  grid-template-columns minmax(10px, max-content) 1fr minmax(10px, max-content)
  grid-template-rows repeat(2, 1fr)
  grid-column-gap 20px
  padding-left $m5
  border-radius $m4
  border-bottom 1px solid var(--c-bg-6)

  +media-hover()
    item-bg-active()

  &._draggable
    item-bg-active()

  &__icon
    grid-column 1 / 2
    grid-row 1 / -1
    align-self center

  &__name
    grid-column 2 / 3
    grid-row 1 / 3
    align-self center
    item-main-text()

  &__drag
    cursor pointer
    grid-column 3 / 4
    grid-row 1 / 3
    align-self center
    justify-self cent
    item-icon()
    display flex
    align-items center
    justify-content center
    width 40px
    height 40px
</style>
