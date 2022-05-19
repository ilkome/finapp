<script setup lang="ts">
import useWallets from '~/components/wallets/useWallets'

const { $store } = useNuxtApp()
const activeTab = computed(() => $store.state.ui.activeTab)
const { walletsCurrencies } = useWallets()
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
UiPage
  UiHeader
    UiHeaderTitle {{ $t('wallets.name') }}
    template(#actions)
      UiHeaderLink(@click="$store.dispatch('ui/setActiveTab', 'walletsSort')")
        UiIconSort.w-6.h-6.group-hover_text-white

      UiHeaderLink(@click="$router.push('/wallets/new')")
        UiIconAdd.w-6.h-6.group-hover_text-white

  .pb-6.px-3(v-if="walletsCurrencies.length > 1")
    WalletsCurrenciesChanger

  .pb-12.px-3
    WalletsTotal

  //- Total
  .pb-4.px-3(v-if="$store.getters['user/isDevUser']")
    .flex
      .cursor-pointer.p-1.px-3.flex.items-center.gap-3.rounded-md.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
        @click="$router.push('/wallets/total')"
      )
        .mdi.mdi-poll.text-xl
        .text-xs.leading-none.text-skin-item-base Total details
        .mdi.mdi-chevron-right.text-lg.leading-none.text-skin-item-base-down

  //- List
  //---------------------------------
  WalletsList(#default="{ walletsItemsSorted }")
    .pb-12.px-3.grid.gap-y-1.gap-x-6.md_grid-cols-2
      //- Wallet
      .cursor-pointer.flex.items-center.py-2.px-3.rounded-md.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
        v-for="(walletItem, walletId) in walletsItemsSorted"
        :key="walletId"
        @click="$router.push(`/wallets/${walletId}`)"
      )
        .grow.gap-x-3.flex.items-center
          .grow.flex-center.gap-x-3
            //- Icon
            .w-6.h-6.rounded-md.flex-center.text-skin-icon-base.text-xs.leading-none(
              :style="{ background: walletItem.color }"
              class="mt-[2px]"
            ) {{ walletItem.name.substring(0, 2) }}
            .grow.flex.items-center.gap-3
              .text-sm.text-skin-item-base {{ walletItem.name }}
              UiIconWalletWithdrawal.w-4.h-4.text-skin-item-base-down(
                v-if="walletItem.countTotal"
              )
              UiIconWalletSavings.w-4.h-4.text-skin-item-base-down(
                v-if="!walletItem.countTotal && !walletItem.isCredit"
              )

          //- Amount
          Amount(
            :amount="walletItem.amount"
            :currencyCode="walletItem.currency"
          )

  template(#bottom)
    .pb-4.px-3.flex.justify-evenly.gap-6
      //- Sort
      .cursor-pointer.grow.py-3.px-5.flex-center.rounded-full.text-sm.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
        class="basis-1/2 max-w-[280px]"
        @click="$store.dispatch('ui/setActiveTab', 'walletsSort')"
      ) {{ $t('base.sort') }}

      //- Create
      .cursor-pointer.grow.py-3.px-5.flex-center.rounded-full.text-sm.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
        class="basis-1/2 max-w-[280px]"
        @click="$router.push('/wallets/new')"
      ) {{ $t('wallets.new') }}

  //- Sort
  //-----------------------------------
  Portal(v-if="activeTab === 'walletsSort'" to="modal" key="walletsSort")
    ModalBottom(
      isShow
      key="walletsSort"
      @onClose="$store.dispatch('ui/setActiveTab', null)"
    )
      template(#default="{ closeModal }")
        WalletsSort(
          v-if="activeTab === 'walletsSort'"
          @closeModal="closeModal"
        )

  //- Portal(
  //-   v-if="activeTab === 'walletsSort'"
  //-   to="modal"
  //- )
  //-   BaseBottomSheet(
  //-     :maxHeight="height"
  //-     insideClass="bg-skin-layout-main"
  //-     @closed="$store.dispatch('ui/setActiveTab', null)"
  //-   )
  //-     template(#handler="{ close }")
  //-       BaseBottomSheetHandler
  //-       BaseBottomSheetClose(@onClick="close")

  //-     template(#header)
  //-       .py-4.px-3.rounded-t-2xl.text-center.text-neutral-800.dark_text-white.text-xl.font-semibold.font-nunito.bg-skin-layout-main
  //-         | {{ $t('wallets.sortTitle') }}

  //-     template(#default="{ close }")
  //-       WalletsSort(
  //-         v-if="activeTab === 'walletsSort'"
  //-         @closeModal="close"
  //-       )
</template>
