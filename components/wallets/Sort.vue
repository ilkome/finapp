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

      const result = await this.$store.dispatch(
        'wallets/saveWalletsOrder',
        sortedWallets,
      )

      if (result.success) {
        if (this.$listeners.closeModal)
          this.$listeners.closeModal()

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
.h-full.overflow.overflow-x-auto.bg-skin-layout-main
  //- Header
  //-----------------------------------
  .pb-4.px-2.text-center.text-skin-item-base.text-xl.font-nunito.font-semibold
    | {{ $t('wallets.sortTitle') }}

  //- Items
  //-----------------------------------
  Draggable.grid.gap-1(
    v-model="sortedWalletsIds"
    handle=".handle"
    ghost-class="_draggable"
  )
    .overflow-hidden.py-0.pl-3.flex.items-center.gap-3.rounded-md.bg-skin-item-main-bg(
      v-for="walletId in sortedWalletsIds"
      :key="walletId"
    )
      .grow.flex-center.gap-x-3
        .w-6.h-6.rounded-md.flex-center.text-neutral-50.text-xs.leading-none(
          :style="{ background: $store.state.wallets.items[walletId].color }"
          class="mt-[2px]"
        ) {{ $store.state.wallets.items[walletId].name.substring(0, 2) }}
        .grow.text-sm.text-neutral-500.dark_text-neutral-400 {{ $store.state.wallets.items[walletId].name }}

        .cursor-grab.flex-center.w-11.h-11.handle.doNotCloseModal.hocus_bg-skin-item-main-hover
          svg.w-6.h-6(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24")
            path(fill="currentColor" d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2s.9-2 2-2s2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2z")

  .pt-6
    SharedButton(
      className="_blue2 _text-center"
      :title="$t('base.save')"
      @onClick="saveWalletsOrder"
    )

//- .px-3
//-   //- Items
//-   //-----------------------------------
//-   Draggable.grid.gap-1(
//-     v-model="sortedWalletsIds"
//-     handle=".handle"
//-     ghost-class="_draggable"
//-   )
//-     .overflow-hidden.flex.items-center.gap-3.bg.py-0.pl-3.rounded-md(
//-       v-for="walletId in sortedWalletsIds"
//-       :key="walletId"
//-     )
//-       .grow.flex-center.gap-x-3
//-         .w-6.h-6.rounded-md.flex-center.text-neutral-50.text-xs.leading-none(
//-           :style="{ background: $store.state.wallets.items[walletId].color }"
//-           class="mt-[2px]"
//-         ) {{ $store.state.wallets.items[walletId].name.substring(0, 2) }}
//-         .grow.text-sm.text-neutral-500.dark_text-neutral-400 {{ $store.state.wallets.items[walletId].name }}

//-         .cursor-grab.flex-center.w-11.h-11.handle.doNotCloseModal.hocus_bg-gray-100.dark_hocus_bg-neutral-800
//-           svg.w-6.h-6(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24")
//-             path(fill="currentColor" d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2s.9-2 2-2s2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2z")

//-   .pt-6
//-     SharedButton(
//-       className="_blue2 _text-center"
//-       :title="$t('base.save')"
//-       @onClick="saveWalletsOrder"
//-     )
</template>
