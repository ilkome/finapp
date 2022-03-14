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
.overflow.overflow-x-auto.h-full.grid.max-w-3xl(
  class="md_pb-[52px] pb-[44px] lg_pb-0 grid-rows-[1fr_auto]"
)
  div
    //- Header
    //---------------------------------
    .flex
      //- Title
      .grow.py-6.px-3.font-nunito.text-neutral-800.dark_text-white.text-2xl.leading-none.font-semibold
        | {{ $t('wallets.name') }}

      //- Actions
      .flex-center.gap-3.pr-3
        //- Sort
        .cursor-pointer.group.w-10.h-10.flex-center.rounded-full.bg-gray-50.dark_bg-dark5.hocus-text-white.hocus_bg-blue2(
          @click="$store.dispatch('ui/setActiveTab', 'walletsSort')"
        )
          svg.group-hover_text-white.w-6.h-6(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24")
            path(fill="currentColor" d="M7 20h2V8h3L8 4L4 8h3zm13-4h-3V4h-2v12h-3l4 4z")

        //- Add
        .cursor-pointer.group.w-10.h-10.flex-center.rounded-full.bg-gray-50.dark_bg-dark5.hocus-text-white.hocus_bg-blue2(
          @click="$store.dispatch('ui/setActiveTab', 'createWallet')"
        )
          svg.group-hover_text-white.w-6.h-6(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12")
            path(fill="currentColor" d="M6 1.5a.5.5 0 0 0-1 0V5H1.5a.5.5 0 0 0 0 1H5v3.5a.5.5 0 0 0 1 0V6h3.5a.5.5 0 0 0 0-1H6V1.5Z")

    .pb-12.px-3
      //- Total
      WalletsTotalAlt(
        isShowCredits
        isShowSavings
      )

    //- List
    //---------------------------------
    .pb-12.px-3.grid.gap-y-1.gap-x-6.md_grid-cols-2
      //- Item
      .cursor-pointer.py-2.px-3.rounded-md.bg-gray-50.dark_bg-dark5.hocus_bg-gray-100.dark_hocus_bg-neutral-800(
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
