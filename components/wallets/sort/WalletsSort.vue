<script>
import Draggable from 'vuedraggable'
import { random, successEmo } from '~/assets/js/emo'

export default {
  components: { Draggable },

  data() {
    return {
      sortedWalletsIds: [...this.$store.getters['wallets/walletsSortedIds']],
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
  .pb-8.flex.justify-between
    .text-neutral-800.dark_text-white.text-2xl.font-semibold.font-nunito
      | {{ $t('wallets.sortTitle') }}

    .cursor-pointer.text-white.bg-blue2.rounded-full.w-10.h-10.flex-center.hocus-text-white.hocus_bg-blue1(
      @click="saveWalletsOrder"
    )
      svg.w-6.h-6(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16")
        path(fill="currentColor" d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06a.733.733 0 0 1 1.047 0l3.052 3.093l5.4-6.425a.247.247 0 0 1 .02-.022Z")

  Draggable.grid.gap-1(
    v-model="sortedWalletsIds"
    handle=".handle"
    ghost-class="_draggable"
  )
    .overflow-hidden.flex.items-center.gap-3.bg.py-0.pl-3.rounded-md(
      v-for="walletId in sortedWalletsIds"
      :key="walletId"
    )
      .grow.flex-center.gap-x-3
        .w-6.h-6.rounded-md.flex-center.text-neutral-50.text-xs.leading-none(
          :style="{ background: $store.state.wallets.items[walletId].color }"
          class="mt-[2px]"
        ) {{ $store.state.wallets.items[walletId].name.substring(0, 2) }}
        .grow.text-sm.text-neutral-500(class="dark_text-neutral-400") {{ $store.state.wallets.items[walletId].name }}

        .cursor-grab.flex-center.w-11.h-11.handle.doNotCloseModal.hocus_bg-gray-100.dark_hocus_bg-neutral-800
          svg.w-6.h-6(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24")
            path(fill="currentColor" d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2s.9-2 2-2s2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2z")

  .pt-6
    SharedButton(
      className="_blue2 _text-center"
      :title="$t('base.save')"
      @onClick="saveWalletsOrder"
    )
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables"

.bg
  background var(--c-item-bg-main)

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
</style>
