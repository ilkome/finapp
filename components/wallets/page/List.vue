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

    <div class="grid items-start gap-5 px-2 md_grid-cols-[auto_auto] md_gap-8">
      <div class="grid gap-5 md_gap-3 md_order-2">
        <!-- Base currency -->
        <div
          v-if="walletsCurrencies.length > 1"
          class="grid w-full gap-2 overflow-hidden md_order-3"
        >
          <UiTitle3>{{ t("currenciesBase") }}</UiTitle3>
          <CurrenciesChanger />
        </div>

        <!-- Wallets Currencies -->
        <div v-if="walletsCurrencies.length > 1" class="grid gap-2 md_order-1">
          <UiTitle3>{{ t("list") }}</UiTitle3>
          <div class="w-full overflow-hidden">
            <UiTabs2>
              <UiTabsItem2
                :isActive="state.activeTab === 'all'"
                @click="walletsCurrenciesTabs.onSelect('all')"
              >
                {{ t("all") }}
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
          :currencyCode="currenciesStore.base"
          :walletsItems="walletsCurrenciesTabs.wallets"
          class="_border rounded-lg border-item-5 bg-item-4 px-2 py-1.5 md_order-2 lg_max-w-[360px]"
        />
      </div>

      <div
        class="grid gap-1 mb-24 py-2 lg_max-w-[360px]"
      >
        <WalletsItem3
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
  </UiPage>

  <!-- Sort -->
  <WalletsSortModal v-if="isModalOpen('walletsSort')" />
</template>

<i18n lang="yaml">
en:
  all: All
  list: Wallets Currencies
  currenciesBase: Base currency

ru:
  all: Все
  list: Валюты кошельков
  currenciesBase: Основная валюта
</i18n>
