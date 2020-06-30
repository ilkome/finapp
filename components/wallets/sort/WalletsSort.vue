<script>
import draggable from 'vuedraggable'
import Button from '~/components/shared/button/Button'
import ComponentWrap from '~/components/layout/component/Component'
import WalletsList from '~/components/wallets/list/WalletsList2'
import WalletsTotal from '~/components/wallets/total/WalletsTotal'

import Amount from '~/components/amount/Amount'
import Icon from '~/components/icon/Icon'

export default {
  components: {
    Amount,
    draggable,
    Button,
    Icon,
    ComponentWrap,
    WalletsList,
    WalletsTotal
  },

  data () {
    return {
      sortedWalletsIds: this.$store.getters['wallets/walletsSortedIds']
    }
  },

  methods: {
    /**
      * Get array of wallets IDs
      * Convert them to objects with order value
      * Push object with wallets to DB
      *
    */
    async saveWalletsOrder () {
      const sortedWallets = {}

      for (const [idx, walletId] of this.sortedWalletsIds.entries()) {
        sortedWallets[walletId] = idx
      }

      const result = await this.$store.dispatch('wallets/saveWalletsOrder', sortedWallets)
      if (result.succsess) {
        this.$store.dispatch('ui/setActiveTab', 'wallets')
        this.$notify({
          type: 'success',
          title: 'OK',
          text: 'Saved'
        })
      }
    }
  }
}
</script>

<template lang="pug">
ComponentWrap(:contentPadding="$store.state.ui.pc")
  template(slot="headerLeft") {{ $lang.wallets.sortTitle }}

  template(slot="content")
    WalletsList(
      :style="{ paddingTop: '10px' }"
      v-slot="{ wallets }")
      draggable(
        v-model="sortedWalletsIds"
        handle=".handle"
        ghost-class="_draggable")
        template(v-for="walletId in sortedWalletsIds")
          .walletItem2(:key="walletId")
            .walletItem2__icon.handle
              Icon(
                :abbr="$store.state.wallets.items[walletId].name"
                :background="$store.state.wallets.items[walletId].color || $store.state.ui.defaultBgColor")

            .walletItem2__name {{ $store.state.wallets.items[walletId].name }}
            .walletItem2__drag.handle: .mdi.mdi-arrow-split-horizontal

  template(slot="bottom")
    .col
      Button(
        className="_small _blue _text-center"
        :title="$lang.base.save"
        @onClick="saveWalletsOrder")
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables"

item-bg-active()
  background var(--c-bg-6)

item-main-text()
  color var(--c-font-4)
  fs-m()

item-icon()
  font-size 22px
  color var(--c-font-5)

  &:active
    item-bg-active()

.walletItem2
  display grid
  grid-template-columns minmax(10px, max-content) 1fr minmax(10px, max-content)
  grid-template-rows repeat(2, 1fr)
  grid-column-gap 20px
  padding 0px 16px

  +media-laptop()
    padding 0

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
