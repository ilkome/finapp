<script setup lang="ts">
import localforage from 'localforage'
import useWallets from '~/components/wallets/useWallets'
import { useAppNav } from '~/components/app/useAppNav'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useFilter } from '~/components/filter/useFilter'

const { $i18n } = useNuxtApp()
const { t } = useI18n()
useSeoMeta({
  title: $i18n.t('wallets.name'),
})

const currenciesStore = useCurrenciesStore()
const { openModal, closeAllModals, isModalOpen } = useAppNav()
const { setWalletId } = useFilter()
const { walletsCurrencies, walletsItemsSorted } = useWallets()

const state = ref({
  activeTab: 'all',
})

const walletsCurrenciesTabs = reactive({
  currencyCode: computed(() => {
    if (state.value.activeTab === 'all')
      return currenciesStore.base
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
        .filter(([_key, value]) => value.currency === state.value.activeTab),
    )
  }),
})
</script>

<template lang="pug">
UiPage
  UiHeader
    UiHeaderTitle {{ $t('wallets.name') }}
    template(#actions)
      UiHeaderLink(@click="openModal('walletsSort')")
        UiIconSort.w-5.h-5.group-hover_text-white

      UiHeaderLink(@click="$router.push('/wallets/new')")
        UiIconAdd.w-5.h-5.group-hover_text-white

  //- Base currency
  .px-2.pb-4(v-if="walletsCurrencies.length > 1")
    UiTitle.pb-2 {{ t('currenciesBase') }}
    WalletsCurrenciesChanger

  UiTitle.px-2.pb-2 {{ t('list') }}

  //- Tabs
  .pb-4.px-2(v-if="walletsCurrencies.length > 1")
    UiTabs
      UiTabsItem(
        :isActive="state.activeTab === 'all'"
        @click="walletsCurrenciesTabs.onSelect('all')"
      ) All
      UiTabsItem(
        v-for="currency in walletsCurrencies"
        :key="currency"
        :isActive="state.activeTab === currency"
        @click="walletsCurrenciesTabs.onSelect(currency)"
      ) {{ currency }}

  //- Total
  .pb-4.px-2
    //- WalletsTotal(
    //-   :walletsItems="walletsCurrenciesTabs.wallets"
    //-   :currencyCode="walletsCurrenciesTabs.currencyCode"
    //- )

  //- List
  //---------------------------------
  .pb-12.px-2.grid.gap-y-1.gap-x-6.md_grid-cols-2
    //- Wallet
    .cursor-pointer.flex.items-center.py-2.px-3.rounded-md.bg-item-4.hocus_bg-item-5(
      v-for="(walletItem, walletId) in walletsCurrenciesTabs.wallets"
      :key="walletId"
      @click="$router.push(`/wallets/${walletId}`)"
    )
      .grow.gap-x-3.flex.items-center
        .grow.flex-center.gap-x-3
          //- Icon
          .w-6.h-6.rounded-md.flex-center.text-icon-primary.text-xs.leading-none(
            :style="{ background: walletItem.color }"
            class="mt-[2px]"
            @click.stop="setWalletId(walletId)"
          ) {{ walletItem.name.substring(0, 2) }}

          .grow.flex.items-center.gap-3
            .text-secondary2.text-sm {{ walletItem.name }}
            UiIconWalletWithdrawal.w-4.h-4.text-item-2(
              v-if="walletItem.countTotal"
            )
            UiIconWalletSavings.w-4.h-4.text-item-2(
              v-if="!walletItem.countTotal && !walletItem.isCredit"
            )

        //- Amount
        Amount(
          :amount="walletItem.amount"
          :currencyCode="walletItem.currency"
        )

  //- Sort
  //-----------------------------------
  Teleport(
    v-if="isModalOpen('walletsSort')"
    to="body"
  )
    ModalBottom(
      isShow
      key="walletsSort"
      @onClose="closeAllModals"
    )
      template(#default="{ closeModal }")
        WalletsSort(
          v-if="isModalOpen('walletsSort')"
          @closeModal="closeAllModals"
        )
</template>

<i18n lang="yaml">
en:
  list: List
  currenciesBase: Base currency

ru:
  list: Список
  currenciesBase: Основная валюта
</i18n>
