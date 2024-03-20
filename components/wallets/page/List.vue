<script setup lang="ts">
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
const { openModal, isModalOpen } = useAppNav()
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

    <div class="grid gap-5 px-2">
      <!-- Base currency -->
      <div v-if="walletsCurrencies.length > 1" class="grid gap-2 overflow-hidden w-full">
        <UiTitle2>{{ t("currenciesBase") }}</UiTitle2>
        <CurrenciesChanger />
      </div>

      <!-- Wallets Currencies -->
      <div v-if="walletsCurrencies.length > 1" class="grid gap-2">
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

      <!-- List -->
      <div class="grid gap-x-6 gap-y-1 pb-12 md_grid-cols-2">
        <div
          v-for="(walletItem, walletId) in walletsCurrenciesTabs.wallets"
          :key="walletId"
          class="flex items-center rounded-md bg-item-4 px-3 py-2 text-secondary2 hocus_bg-item-5"
          @click="$router.push(`/wallets/${walletId}`)"
        >
          <div class="flex grow items-center gap-x-3">
            <div class="flex-center grow gap-x-3">
              <WalletsIcon
                :color="walletItem.color"
                :name="walletItem.name"
                :walletId
                @click.stop="setWalletId(walletId)"
              />

              <div class="flex grow items-center gap-3 text-sm">
                {{ walletItem.name }}

                <UiIconWalletWithdrawal
                  v-if="walletItem.countTotal"
                  class="h-4 w-4 text-item-2"
                />

                <UiIconWalletSavings
                  v-if="!walletItem.countTotal && !walletItem.isCredit"
                  class="h-4 w-4 text-item-2"
                />
              </div>
            </div>

            <Amount
              :amount="walletItem.amount"
              :currencyCode="walletItem.currency"
            />
          </div>
        </div>
      </div>
    </div>
  </UiPage>

  <!-- Sort -->
  <WalletsSortModal v-if="isModalOpen('walletsSort')" />
</template>

<i18n lang="yaml">
en:
  list: List
  currenciesBase: Base currency

ru:
  list: Список
  currenciesBase: Основная валюта
</i18n>
