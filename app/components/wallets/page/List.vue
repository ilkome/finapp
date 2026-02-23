<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { WalletsGroupedBy } from '~/components/wallets/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useUserStore } from '~/components/user/useUserStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

import { useWalletsPageCounts } from './useWalletsPageCounts'
import { useWalletsPageFilter } from './useWalletsPageFilter'
import { useWalletsPageGrouping } from './useWalletsPageGrouping'

const { t } = useI18n()
const router = useRouter()

useSeoMeta({
  ogTitle: t('wallets.name'),
  title: t('wallets.name'),
})

const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()
const userStore = useUserStore()
const isSortModalOpen = ref(false)

const isShowBaseCurrencyModal = ref(false)
const isOpen = ref(false)

const groupedBy = useStorage<WalletsGroupedBy>('finapp-wallets-groupedBy', 'none')

const {
  currencyFiltered,
  isShowCurrencyFilter,
  onSelectFilterCurrency,
  selectedWalletsIds,
  selectedWalletsIdsWithCurrency,
  setWalletViewType,
  walletViewType,
} = useWalletsPageFilter(groupedBy)

const {
  counts,
  countWalletsSum,
} = useWalletsPageCounts(selectedWalletsIdsWithCurrency)

const {
  groupedBySecondary,
  groupedWalletsWithIds,
  groupTabs,
  toggleMap,
  toggleOpened,
  typeGroupsStatus,
  walletsToggledMap,
} = useWalletsPageGrouping(selectedWalletsIds, groupedBy)
</script>

<template>
  <UiPage>
    <!-- Header -->
    <UiHeader>
      <UiHeaderTitle>{{ t('wallets.name') }}</UiHeaderTitle>

      <template #actions>
        <UiActionButton @click="router.push('/wallets/new')">
          <Icon name="lucide:plus" size="24" />
        </UiActionButton>

        <BottomSheetOrDropdown
          :isOpen="isOpen"
          isShowCloseBtn
          @closeModal="isOpen = false"
          @openModal="isOpen = true"
        >
          <template #trigger>
            <UiActionButton>
              <Icon name="lucide:ellipsis-vertical" size="20" />
            </UiActionButton>
          </template>

          <template #content>
            <div class="p-1 pt-4 pb-3">
              <UiHeaderLink
                v-if="walletsStore.sortedIds.length > 1"
                icon="lucide:arrow-down-up"
                @click="isSortModalOpen = true"
              >
                {{ t('wallets.sortTitle') }}
              </UiHeaderLink>
            </div>
          </template>
        </BottomSheetOrDropdown>
      </template>
    </UiHeader>

    <!-- Empty -->
    <div
      v-if="!walletsStore.hasItems"
      class="flex-center grow flex-col"
    >
      <UiTitleSection class="pb-4">
        {{ t('wallets.new') }}
      </UiTitleSection>
      <UiButtonAccent
        rounded
        @click="router.push('/wallets/new')"
      >
        {{ t('wallets.new') }}
      </UiButtonAccent>
    </div>

    <!-- Content -->
    <div
      v-else
      class="grid max-w-5xl grow px-2 lg:px-4 2xl:px-8 @xl/page:grid-cols-2 @xl/page:gap-6 @3xl/page:gap-12"
    >
      <!-- Right -->
      <div class="grid content-start gap-3 @xl/page:order-1 @xl/page:gap-4 @xl/page:pt-1 @3xl/main:max-w-sm">
        <!-- Wallets Currencies -->
        <WalletsCurrencies
          v-if="walletsStore.currenciesUsed.length > 1 && groupedBy !== 'currency'"
          :currencyFiltered
          @selectFilterCurrency="code => currencyFiltered = code"
        />

        <!-- Total -->
        <div class="flex flex-wrap justify-stretch gap-2 @2xl/page:justify-start">
          <StatSumItem
            :title="t('money.types.total')"
            :amount="counts.total.value"
            type="netIncome"
            @click="setWalletViewType(counts.total.id)"
          />
          <StatSumItem
            v-if="counts.available.value !== 0 && counts.available.value !== counts.total.value"
            :title="t('money.types.available')"
            :amount="counts.available.value"
            type="netIncome"
            @click="setWalletViewType(counts.available.id)"
          />
        </div>

        <WalletsStatistics
          :storageKey="`finapp-wallets-total-${groupedBy}`"
          :activeType="walletViewType"
          :currencyCode="currenciesStore.base"
          :counts="counts"
          @click="setWalletViewType"
        />
      </div>

      <!-- Left content -->
      <div class="@3xl/main:max-w-sm">
        <div class="mb-2 flex min-h-12 items-center gap-2 md:pt-2 ">
          <UiTabsScroll>
            <UiTabsItemPill
              v-for="item in groupTabs"
              :key="item.id"
              variant="outline"
              :isActive="item.id === groupedBy"
              @click="groupedBy = item.id"
            >
              {{ item.label }}
            </UiTabsItemPill>
          </UiTabsScroll>

          <div
            v-if="groupedBy !== 'none'"
            class="ml-auto flex items-center gap-1"
          >
            <UiActionButton
              @click="
                groupedBy === 'currency'
                  ? groupedBySecondary.currency = !groupedBySecondary.currency
                  : groupedBy === 'type'
                    ? groupedBySecondary.type = !groupedBySecondary.type
                    : null
              "
            >
              <Icon
                :name="
                  (groupedBy === 'currency' && groupedBySecondary.currency)
                    || (groupedBy === 'type' && groupedBySecondary.type)
                    ? 'lucide:network'
                    : 'lucide:folder-tree'
                "
                size="18"
              />
            </UiActionButton>

            <UiActionButton @click="toggleOpened">
              <Icon
                v-if="typeGroupsStatus.isAllOpen"
                name="lucide:folder-open"
              />
              <Icon
                v-else-if="typeGroupsStatus.isAnyOpen"
                name="lucide:folder-open-dot"
              />
              <Icon
                v-else
                name="lucide:folder"
              />
            </UiActionButton>
          </div>
        </div>

        <!-- Wallets List -->
        <div class="md:max-w-lg @xl/page:max-w-lg">
          <!-- No grouping -->
          <div
            v-if="groupedBy === 'none'"
            class="border-item-4 bg-item-2 rounded-xl md:max-w-lg"
          >
            <WalletsItem
              v-for="walletId in selectedWalletsIds"
              :key="walletId"
              :wallet="walletsStore.itemsComputed[walletId]!"
              :walletId
              :lineWidth="2"
              class="group"
              isShowBaseRate
              isShowIcon
              isShowRate
              isShowCreditLimit
              @click="router.push(`/wallets/${walletId}`)"
            />
          </div>

          <!-- Grouping -->
          <div
            v-if="groupedBy !== 'none' && groupedWalletsWithIds"
            class="grid gap-4"
          >
            <UiToggleControlled
              v-for="(content, groupPrimary) in groupedWalletsWithIds"
              :key="groupPrimary"
              :class="{
                'bg-item-2 rounded-sm': Object.keys(content.groups ?? {}).length === 0,
              }"
              :isShown="
                walletsToggledMap[groupedBy]?.[groupPrimary]?.show ?? true
              "
            >
              <template #header="{ isShown }">
                <UiTitleDropRight
                  :isShown
                  @click="toggleMap(groupPrimary)"
                >
                  <div class="font-tertiary !text-3 text-base leading-none font-semibold">
                    {{ groupedBy === 'type' ? t(`money.types.${groupPrimary}`) : groupPrimary }}
                  </div>

                  <div class="ml-auto opacity-60">
                    <Amount
                      :amount="countWalletsSum(content.ids)"
                      :currencyCode="currenciesStore.base"
                      :isShowBaseRate="false"
                      variant="sm"
                    />
                    <Amount
                      v-if="groupedBy === 'currency' && currenciesStore.base !== groupPrimary"
                      :amount="countWalletsSum(content.ids, false)"
                      :currencyCode="groupPrimary"
                      :isShowBaseRate="false"
                      variant="2xs"
                    />
                  </div>
                </UiTitleDropRight>
              </template>

              <div
                v-if="Object.keys(content.groups ?? {}).length > 0"
                class="grid gap-2"
              >
                <UiToggleControlled
                  v-for="(ids, groupSecondary) in content.groups"
                  :key="groupSecondary"
                  :isShown="
                    walletsToggledMap[groupedBy]?.[groupPrimary]?.groups?.[groupSecondary] ?? true
                  "
                  class="_border border-item-4 bg-item-2 group grid gap-1 rounded-xl"
                >
                  <template #header="{ isShown }">
                    <UiTitleDropRight
                      :isShown
                      @click="toggleMap(groupPrimary, groupSecondary)"
                    >
                      <div class="font-tertiary text-base leading-none font-semibold">
                        {{ groupedBy === 'currency' ? t(`money.types.${groupSecondary}`) : groupSecondary }}
                      </div>
                      <div class="ml-auto">
                        <Amount
                          :amount="countWalletsSum(ids)"
                          :currencyCode="currenciesStore.base"
                          :isShowBaseRate="false"
                        />
                        <Amount
                          v-if="groupedBy === 'currency' && currenciesStore.base !== groupPrimary"
                          :amount="countWalletsSum(ids, false)"
                          :currencyCode="groupPrimary"
                          :isShowBaseRate="false"
                          variant="2xs"
                        />
                      </div>
                    </UiTitleDropRight>
                  </template>

                  <WalletsItem
                    v-for="walletId in ids"
                    :key="walletId"
                    :lineWidth="2"
                    :wallet="walletsStore.itemsComputed[walletId]!"
                    :walletId
                    class="group"
                    isShowBaseRate
                    isShowCreditLimit
                    isShowIcon
                    isShowRate
                    @click="router.push(`/wallets/${walletId}`)"
                  />
                </UiToggleControlled>
              </div>

              <template v-else>
                <WalletsItem
                  v-for="walletId in content.ids"
                  :key="walletId"
                  :lineWidth="2"
                  :wallet="walletsStore.itemsComputed[walletId]!"
                  :walletId
                  class="group"
                  isShowBaseRate
                  isShowCreditLimit
                  isShowIcon
                  isShowRate
                  @click="router.push(`/wallets/${walletId}`)"
                />
              </template>
            </UiToggleControlled>
          </div>
        </div>
      </div>
    </div>
  </UiPage>

  <!-- Sort Modal -->
  <WalletsSortModal v-if="isSortModalOpen" @close="isSortModalOpen = false" />

  <!-- Base Currency Modal -->
  <CurrenciesModal
    v-if="isShowBaseCurrencyModal"
    :activeCode="currenciesStore.base"
    @select="userStore.setUserBaseCurrency"
    @close="isShowBaseCurrencyModal = false"
  />

  <!-- Currency Filter Modal -->
  <CurrenciesModal
    v-if="walletsStore.currenciesUsed.length > 1 && isShowCurrencyFilter"
    :activeCode="currencyFiltered"
    isShowAllButton
    isHideUnused
    @select="onSelectFilterCurrency"
    @close="isShowCurrencyFilter = false"
  />
</template>
