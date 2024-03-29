<script setup lang="ts">
import useWallets from '~/components/wallets/useWallets'
import { useAppNav } from '~/components/app/useAppNav'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useFilterStore } from '~/components/filter/useFilterStore'

const { $i18n } = useNuxtApp()
const { t } = useI18n()
useSeoMeta({
  title: $i18n.t('wallets.name'),
})

const currenciesStore = useCurrenciesStore()
const { openModal, isModalOpen } = useAppNav()
const { setWalletId } = useFilterStore()
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
      Object.entries(walletsItemsSorted.value).filter(
        ([_key, value]) => value.currency === state.value.activeTab,
      ),
    )
  }),
})
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle2>{{ $t("wallets.name") }}</UiHeaderTitle2>
      <template #actions>
        <UiHeaderLink @click="openModal('walletsSort')">
          <UiIconSort class="h-5 w-5 group-hover_text-white" />
        </UiHeaderLink>
        <UiHeaderLink @click="$router.push('/wallets/new')">
          <UiIconAdd class="h-5 w-5 group-hover_text-white" />
        </UiHeaderLink>
      </template>
    </UiHeader>

    <div class="grid gap-5 px-2 md_gap-8 md_grid-cols-[auto_auto] items-start">
      <div class="grid gap-5 md_order-2">
        <!-- Base currency -->
        <div v-if="walletsCurrencies.length > 1" class="md_order-3 grid gap-2 overflow-hidden w-full">
          <UiTitle2>{{ t("currenciesBase") }}</UiTitle2>
          <CurrenciesChanger />
        </div>

        <!-- Wallets Currencies -->
        <div v-if="walletsCurrencies.length > 1" class="md_order-1 grid gap-2">
          <UiTitle2>{{ t("list") }}</UiTitle2>
          <div class="overflow-hidden w-full">
            <UiTabs2>
              <UiTabsItem2
                :isActive="state.activeTab === 'all'"
                @click="walletsCurrenciesTabs.onSelect('all')"
              >
                All
              </UiTabsItem2>

              <UiTabsItem2
                v-for="currency in walletsCurrencies"
                :key="currency"
                :isActive="state.activeTab === currency"
                @click="walletsCurrenciesTabs.onSelect(currency)"
              >
                {{ currency }}
              </UiTabsItem2>
            </UiTabs2>
          </div>
        </div>

        <WalletsTotal
          class="lg_max-w-[360px] md_order-2 bg-item-4 border border-item-6 rounded-lg px-2 py-1"
          :currencyCode="currenciesStore.base"
          :walletsItems="walletsCurrenciesTabs.wallets"
        />
      </div>

      <div class="grid gap-5">
        <!-- <div class="max-w-fit">
        <div
          v-for="group in Object.groupBy(Object.values(walletsCurrenciesTabs.wallets), (w) => w.type)"
          class="pb-4"
        >
          <WalletsItem2
            v-for="(walletItem, walletId) in group"
            :key="walletId"
            :walletId
            :wallet="walletItem"
            @click="$router.push(`/wallets/${walletId}`)"
            @filter="setWalletId(walletId)"
          />
        </div>
      </div> -->

        <!-- List -->
        <div class="lg_max-w-[360px] mb-24 bg-item-4 border border-item-6 rounded-lg px-1 py-2">
          <WalletsItem2
            v-for="(walletItem, walletId) in walletsCurrenciesTabs.wallets"
            :key="walletId"
            :walletId
            :wallet="walletItem"
            isShowIcons
            @click="$router.push(`/wallets/${walletId}`)"
            @filter="setWalletId(walletId)"
          />
        </div>
      </div>
    </div>
  </UiPage>

  <!-- Sort -->
  <WalletsSortModal v-if="isModalOpen('walletsSort')" />
</template>

<i18n lang="yaml">
en:
  list: Wallets Currencies
  currenciesBase: Base currency

ru:
  list: Валюты кошельков
  currenciesBase: Основная валюта
</i18n>
