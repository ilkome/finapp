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
      <UiHeaderTitle>{{ $t("wallets.name") }}</UiHeaderTitle>
      <template #actions>
        <UiHeaderLink @click="openModal('walletsSort')">
          <UiIconSort class="h-5 w-5 group-hover_text-white" />
        </UiHeaderLink>
        <UiHeaderLink @click="$router.push('/wallets/new')">
          <UiIconAdd class="h-5 w-5 group-hover_text-white" />
        </UiHeaderLink>
      </template>
    </UiHeader>

    <div class="grid gap-4 px-2">
      <!-- Base currency -->
      <div
        v-if="walletsCurrencies.length > 1"
        class="grid gap-2"
      >
        <UiTitle2>
          {{ t("currenciesBase") }}
        </UiTitle2>
        <WalletsCurrenciesChanger />
      </div>

      <div class="grid gap-2">
        <UiTitle2>
          {{ t("list") }}
        </UiTitle2>

        <!-- Tabs -->
        <div v-if="walletsCurrencies.length > 1" class="">
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
        <!-- Wallet -->
        <div
          v-for="(walletItem, walletId) in walletsCurrenciesTabs.wallets"
          :key="walletId"
          class="flex cursor-pointer items-center rounded-md bg-item-4 px-3 py-2 text-secondary2 hocus_bg-item-5"
          @click="$router.push(`/wallets/${walletId}`)"
        >
          <div class="flex grow items-center gap-x-3">
            <div class="flex-center grow gap-x-3">
              <!-- Icon -->
              <!-- <div
                :style="{ background: walletItem.color }"
                class="flex-center mt-[2px] h-6 w-6 rounded-md text-xs leading-none text-icon-primary"
                @click.stop="setWalletId(walletId)"
              > -->
              <div
                class="border flex-center mt-[2px] w-8 h-6 rounded-md text-2xs leading-none text-icon-primary2"
                :style="{ borderColor: walletItem.color }"
                @click.stop="setWalletId(walletId)"
              >
                {{ walletItem.name.substring(0, 2) }}
              </div>

              <div class="flex grow items-center gap-3">
                <div class="text-sm">
                  {{ walletItem.name }}
                </div>
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

            <!-- Amount -->
            <Amount
              :amount="walletItem.amount"
              :currencyCode="walletItem.currency"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Sort -->
    <Teleport v-if="isModalOpen('walletsSort')" to="body">
      <div class="max-w-sm">
        <BaseBottomSheet2
          keepAlive
          isShow
          drugClassesCustom="max-w-md"
          @closed="closeAllModals"
        >
          <template #header>
            <div
              class="text-item-base px-2 pb-4 text-center font-primary text-xl font-semibold"
            >
              777
            </div>
          </template>

          <WalletsSort
            v-if="isModalOpen('walletsSort')"
            @closeModal="closeAllModals"
          />
        </BaseBottomSheet2>
      </div>

      <!-- <ModalBottom
        key="walletsSort"
        isShow
        @onClose="closeAllModals"
      >
        <WalletsSort
          v-if="isModalOpen('walletsSort')"
          @closeModal="closeAllModals"
        />
      </ModalBottom> -->
    </Teleport>
  </UiPage>
</template>

<i18n lang="yaml">
en:
  list: List
  currenciesBase: Base currency

ru:
  list: Список
  currenciesBase: Основная валюта
</i18n>
