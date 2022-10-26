<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import useWallets from '~/components/wallets/useWallets'

const { $store } = useNuxtApp()
const activeTab = computed(() => $store.state.ui.activeTab)
const { walletsCurrencies, walletsItemsSorted } = useWallets()

const state = useStorage('finapp.page.wallets', {
  activeTab: 'all',
})

const walletsCurrenciesTabs = reactive({
  currencyCode: computed(() => {
    if (state.value.activeTab === 'all')
      return $store.state.currencies.base
    return state.value.activeTab
  }),

  onSelect: (v) => {
    state.value.activeTab = v
    state.value.activeTab = v
  },

  wallets: computed(() => {
    if (state.value.activeTab === 'all')
      return walletsItemsSorted.value

    return Object.fromEntries(
      Object
        .entries(walletsItemsSorted.value)
        .filter(([_key, value]) => value.currency === state.value.activeTab))
  }),
})
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
        UiIconSort.w-5.h-5.group-hover_text-white

      UiHeaderLink(@click="$router.push('/wallets/new')")
        UiIconAdd.w-5.h-5.group-hover_text-white

  //- Base currency
  .pt-4.pb-12.px-2(v-if="walletsCurrencies.length > 1")
    .pb-2.text-md.leading-none.font-nunito.font-semibold.text-skin-item-base {{ $t('currenciesBase') }}
    WalletsCurrenciesChanger

  //- Currencies
  .px-2
    .pb-2.text-md.leading-none.font-nunito.font-semibold.text-skin-item-base {{ $t('list') }}

  //- Tabs
  .pb-4.px-2(v-if="walletsCurrencies.length > 1")
    UiTabs
      UiTabsItem(
        :isActive="state.activeTab === 'all'"
        @click="walletsCurrenciesTabs.onSelect('all')"
      ) All
      UiTabsItem(
        v-for="currency in walletsCurrencies"
        :isActive="state.activeTab === currency"
        @click="walletsCurrenciesTabs.onSelect(currency)"
        :key="currency"
      ) {{ currency }}

  //- Total
  .pb-4.px-2
    WalletsTotal(
      :walletsItems="walletsCurrenciesTabs.wallets"
      :currencyCode="walletsCurrenciesTabs.currencyCode"
    )

  //- List
  //---------------------------------
  .pb-12.px-2.grid.gap-y-1.gap-x-6.md_grid-cols-2
    //- Wallet
    .cursor-pointer.flex.items-center.py-2.px-3.rounded-md.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
      v-for="(walletItem, walletId) in walletsCurrenciesTabs.wallets"
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

<i18n lang="json5">
  {
    "en": {
      "list": "List",
      "currenciesBase": "Base currency",
    },

    "ru": {
      "list": "Список",
      "currenciesBase": "Основная валюта",
    }
  }
  </i18n>
