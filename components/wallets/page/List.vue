<script setup lang="ts">
import useWallets from '~/components/wallets/useWallets'

const { walletsItemsSorted } = useWallets()
</script>

<script lang="ts">
export default defineComponent({
  head() {
    return {
      title: this.$t('wallets.title'),
    }
  },
})
</script>

<template lang="pug">
.h-full.overflow.overflow-x-auto.grid.max-w-3xl.h-full(
  class="pb-[44px] md_pb-[52px] lg_pb-0 lg_grid-rows-[1fr_auto]"
)
  div
    .flex
      .grow.py-6.px-3.font-nunito.text-neutral-800.dark_text-white.text-2xl.leading-none.font-semibold
        | {{ $t('wallets.name') }}

      .flex-center.gap-3.pr-3
        //- Sort
        .cursor-pointer.group.bg.rounded-full.w-10.h-10.flex-center.hocus-text-white.hocus_bg-blue2(
          @click="$store.dispatch('ui/setActiveTab', 'walletsSort')"
        )
          svg.group-hover_text-white.w-6.h-6(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24")
            path(fill="currentColor" d="M7 20h2V8h3L8 4L4 8h3zm13-4h-3V4h-2v12h-3l4 4z")

        //- Add
        .cursor-pointer.group.bg.rounded-full.w-10.h-10.flex-center.hocus-text-white.hocus_bg-blue2(
          @click="$store.dispatch('ui/setActiveTab', 'createWallet')"
        )
          svg.group-hover_text-white.w-6.h-6(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12")
            path(fill="currentColor" d="M6 1.5a.5.5 0 0 0-1 0V5H1.5a.5.5 0 0 0 0 1H5v3.5a.5.5 0 0 0 1 0V6h3.5a.5.5 0 0 0 0-1H6V1.5Z")

    .pb-6.px-3
      WalletsTotalAlt(
        isShowCredits
        isShowSavings
      )

    .pb-6.px-3(v-if="$store.getters['user/isTester']")
      .flex
        .cursor-pointer.p-1.px-3.flex.items-center.gap-3.bg-gray-50.dark_bg-dark4.rounded-md.hocus_bg-gray-100.dark_hocus_bg-neutral-800.shadow.hocus_shadow-lg(
          class="dark_text-white/60"
          @click="$router.push('/wallets/total')"
        )
          .mdi.mdi-poll.text-xl
          .text-xs.leading-none Total
          .mdi.mdi-chevron-right.opacity-70.text-lg.leading-none

    //- List
    //---------------------------------
    .pb-12.px-3.grid.gap-y-1.gap-x-6.md_grid-cols-2
      //- Item
      .bg.cursor-pointer.py-2.px-3.rounded-md.hocus_bg-gray-100.dark_hocus_bg-neutral-800(
        v-for="(walletItem, walletId) in walletsItemsSorted"
        :key="walletId"
        @click="$router.push(`/wallets/${walletId}`)"
      )
        .gap-x-3.flex.items-center
          .grow.flex-center.gap-x-3
            .w-6.h-6.rounded-md.flex-center.text-neutral-50.text-xs.leading-none(
              :style="{ background: walletItem.color }"
              class="mt-[2px]"
            ) {{ walletItem.name.substring(0, 2) }}
            .grow.text-sm.text-neutral-500(class="dark_text-neutral-400") {{ walletItem.name }}

          Amount(
            :currency="walletItem.currency"
            :value="walletItem.amount"
            alwaysShowSymbol
            showBase
            vertical="right"
          )

  .pb-4.px-3.flex.gap-4
    //- Create
    .button(@click="$store.dispatch('ui/setActiveTab', 'createWallet')") {{ $t('wallets.new') }}
    //- Sort
    .button(@click="$store.dispatch('ui/setActiveTab', 'walletsSort')") {{ $t('base.sort') }}
</template>

<style lang="stylus" scoped>
.bg
  background var(--c-item-bg-main)
</style>
