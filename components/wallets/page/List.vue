<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'
import { useAppNav } from '~/components/app/useAppNav'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useFilterStore } from '~/components/filter/useFilterStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { $i18n } = useNuxtApp()
const { t } = useI18n()
useSeoMeta({
  title: $i18n.t('wallets.name'),
})

const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()
const { isModalOpen, openModal } = useAppNav()
const { setWalletId } = useFilterStore()

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
      return walletsStore.sortedItems

    return Object.fromEntries(
      Object.entries(walletsStore.sortedItems).filter(
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
          <UiIconOrder class="size-5" />
        </UiHeaderLink>
        <UiHeaderLink @click="$router.push('/wallets/new')">
          <UiIconAdd class="size-5" />
        </UiHeaderLink>
      </template>
    </UiHeader>

    <div class="grid items-start gap-5 px-2 md_grid-cols-2 md_gap-8">
      <div class="grid gap-5 md_gap-3 md_order-2">
        <!-- Base currency -->
        <div
          v-if="walletsStore.currenciesUsed.length > 1"
          class="grid w-full gap-2 overflow-hidden md_order-3"
        >
          <UiTitle3>{{ t("currenciesBase") }}</UiTitle3>
          <CurrenciesChanger />
        </div>

        <!-- Wallets Currencies -->
        <div v-if="walletsStore.currenciesUsed.length > 1" class="grid gap-2 md_order-1">
          <UiTitle3>{{ t("list") }}</UiTitle3>
          <div class="w-full overflow-hidden">
            <UiTabs2 class="gap-1">
              <UiTabsItem2
                :isActive="state.activeTab === 'all'"
                @click="walletsCurrenciesTabs.onSelect('all')"
              >
                {{ t("all") }}
              </UiTabsItem2>

              <UiTabsItem2
                v-for="currency in walletsStore.currenciesUsed"
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

      <div class="lg_max-w-[360px]">
        <WalletsItem
          v-for="(walletItem, walletId) in walletsCurrenciesTabs.wallets"
          :key="walletId"
          :wallet="walletItem"
          :walletId
          isShowBaseRate
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
