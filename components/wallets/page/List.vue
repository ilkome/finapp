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

const activeCurrency = ref('all')
const activeType = ref('all')

const selectedWallets = computed(() => {
  if (activeCurrency.value === 'all' && activeType.value === 'all')
    return walletsStore.sortedItems

  return Object.fromEntries(
    Object.entries(walletsStore.sortedItems).filter(
      ([_key, wallet]) => {
        if (activeCurrency.value === 'all') {
          if (activeType.value === 'all')
            return true

          if (activeType.value === 'isCredit' && wallet.isCredit) {
            return true
          }

          if (activeType.value === 'isSaving' && !wallet.withdrawal) {
            return true
          }

          if (activeType.value === 'withdrawal' && wallet.withdrawal) {
            return true
          }
          if (activeType.value === 'isDeposit' && wallet.isDeposit) {
            return true
          }

          if (activeType.value === 'isCashless' && wallet.isCashless)
            return true

          if (activeType.value === 'isCash' && wallet.isCash)
            return true

          if (activeType.value === 'creditPossible' && wallet.creditLimit)
            return true

          if (activeType.value === 'withCredit' && !wallet.isCredit)
            return true
        }

        if (activeCurrency.value === wallet.currency) {
          if (activeType.value === 'all')
            return true

          if (activeType.value === 'isCashless' && wallet.isCashless)
            return true

          if (activeType.value === 'isCash' && wallet.isCash)
            return true

          if (activeType.value === 'isCredit' && wallet.isCredit)
            return true

          if (activeType.value === 'isSaving' && !wallet.withdrawal)
            return true

          if (activeType.value === 'withdrawal' && wallet.withdrawal) {
            return true
          }
          if (activeType.value === 'isDeposit' && wallet.isDeposit) {
            return true
          }
          if (activeType.value === 'creditPossible' && wallet.creditLimit)
            return true
          if (activeType.value === 'withCredit' && !wallet.isCredit)
            return true
        }

        return false
      },
    ),
  )
})

const selectedWallets2 = computed(() => {
  if (activeCurrency.value === 'all')
    return walletsStore.sortedItems

  return Object.fromEntries(
    Object.entries(walletsStore.sortedItems).filter(
      ([_key, wallet]) => {
        if (activeCurrency.value === wallet.currency)
          return true

        return false
      },
    ),
  )
})

const walletsCurrenciesTabs = reactive({
  currencyCode: computed(() => {
    if (activeCurrency.value === 'all')
      return currenciesStore.base
    return activeCurrency.value
  }),

  onSelect: (v) => {
    activeCurrency.value = v
  },
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

    <div class="grid items-start gap-5 px-2 md:grid-cols-2 md:gap-8">
      <div class="grid gap-5 md:gap-3 md:order-2 @container/wallets">
        <!-- Base currency -->
        <div
          v-if="walletsStore.currenciesUsed.length > 1"
          class="grid w-full gap-2 overflow-hidden md:order-3"
        >
          <UiTitle3>{{ t("currenciesBase") }}</UiTitle3>
          <CurrenciesChanger />
        </div>

        <!-- Wallets Currencies -->
        <div v-if="walletsStore.currenciesUsed.length > 1" class="grid gap-2 md:order-1">
          <UiTitle3>{{ t("list") }}</UiTitle3>
          <div class="w-full overflow-hidden">
            <UiTabs class="gap-1">
              <UiTabsItem2
                :isActive="activeCurrency === 'all'"
                @click="walletsCurrenciesTabs.onSelect('all')"
              >
                {{ t("all") }}
              </UiTabsItem2>

              <UiTabsItem2
                v-for="currency in walletsStore.currenciesUsed"
                :key="currency"
                :isActive="activeCurrency === currency"
                @click="walletsCurrenciesTabs.onSelect(currency)"
              >
                {{ currency }}
              </UiTabsItem2>
            </UiTabs>
          </div>
        </div>

        <WalletsTotal
          :activeType
          :currencyCode="currenciesStore.base"
          :walletsItems="selectedWallets2"
          class="md:order-2"
          @click="v => activeType = v"
        />
      </div>

      <div class="lg:max-w-[360px]">
        <WalletsItem
          v-for="(walletItem, walletId) in selectedWallets"
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
