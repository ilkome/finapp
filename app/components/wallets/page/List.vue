<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { WalletsGroupedBy, WalletType } from '~/components/wallets/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'
import { useWalletDelete } from '~/components/wallets/useWalletDelete'
import { useWalletsCounts } from '~/components/wallets/useWalletsCounts'
import { useWalletsFilter } from '~/components/wallets/useWalletsFilter'
import { useWalletsGrouping } from '~/components/wallets/useWalletsGrouping'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()

useSeoMeta({
  ogTitle: t('wallets.name'),
  title: t('wallets.name'),
})

const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()
const isSortModalOpen = ref(false)
const isOpen = ref(false)

const {
  cancelDelete,
  confirmDelete,
  deleteInfo,
  deleteWalletId,
  requestDelete,
} = useWalletDelete()

const groupedBy = useStorage<WalletsGroupedBy>(WALLET_STORAGE_KEYS.groupedBy, 'none')

const {
  currencyFiltered,
  selectedWalletsIds,
  selectedWalletsIdsWithCurrency,
  setWalletViewType,
  walletViewType,
} = useWalletsFilter(groupedBy)

const {
  counts,
  countWalletsSum,
} = useWalletsCounts(selectedWalletsIdsWithCurrency)

const {
  groupedWalletsWithIds,
  groupTabs,
  isSecondaryGroupingActive,
  toggleMap,
  toggleOpened,
  toggleSecondaryGrouping,
  typeGroupsStatus,
  walletsToggledMap,
} = useWalletsGrouping(selectedWalletsIds, groupedBy)

function hasGroups(groups: Record<string, unknown> | undefined) {
  return groups ? Object.keys(groups).length > 0 : false
}
</script>

<template>
  <UiPage>
    <!-- Header -->
    <UiHeader>
      <UiHeaderTitle>{{ t('wallets.name') }}</UiHeaderTitle>

      <template #actions>
        <NuxtLink to="/wallets/new">
          <UiActionButton :ariaLabel="$t('wallets.new')">
            <Icon name="lucide:plus" size="24" />
          </UiActionButton>
        </NuxtLink>

        <BottomSheetOrDropdown
          v-if="walletsStore.sortedIds.length > 1"
          :isOpen="isOpen"
          isShowCloseBtn
          @closeModal="isOpen = false"
          @openModal="isOpen = true"
        >
          <template #trigger>
            <UiActionButton :ariaLabel="$t('base.moreOptions')">
              <Icon name="lucide:ellipsis-vertical" size="20" />
            </UiActionButton>
          </template>

          <template #content>
            <div class="p-1 pt-4 pb-3">
              <UiHeaderLink
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
      <NuxtLink to="/wallets/new">
        <UiButtonAccent rounded>
          {{ t('wallets.new') }}
        </UiButtonAccent>
      </NuxtLink>
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
            :amount="counts.total?.value ?? 0"
            type="netIncome"
            @click="setWalletViewType((counts.total?.id ?? 'total') as WalletType | 'total')"
          />
          <StatSumItem
            v-if="counts.available?.value !== 0 && counts.available?.value !== counts.total?.value"
            :title="t('money.types.available')"
            :amount="counts.available?.value ?? 0"
            type="netIncome"
            @click="setWalletViewType((counts.available?.id ?? 'isAvailable') as WalletType | 'total')"
          />
        </div>

        <WalletsStatistics
          :storageKey="`${WALLET_STORAGE_KEYS.totalPrefix}${groupedBy}`"
          :activeType="walletViewType"
          :currencyCode="currenciesStore.base"
          :counts="counts"
          @click="(v: string) => setWalletViewType(v as WalletType | 'total')"
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
              :ariaLabel="$t('base.toggleGrouping')"
              @click="toggleSecondaryGrouping"
            >
              <Icon
                :name="isSecondaryGroupingActive ? 'lucide:network' : 'lucide:folder-tree'"
                size="18"
              />
            </UiActionButton>

            <UiActionButton :ariaLabel="$t('base.toggleFolders')" @click="toggleOpened">
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
            <WalletsPageListItem
              v-for="walletId in selectedWalletsIds"
              :key="walletId"
              :walletId
              @delete="requestDelete"
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
                'bg-item-2 rounded-sm': !hasGroups(content.groups),
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
                v-if="hasGroups(content.groups)"
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

                  <WalletsPageListItem
                    v-for="walletId in ids"
                    :key="walletId"
                    :walletId
                    @delete="requestDelete"
                  />
                </UiToggleControlled>
              </div>

              <template v-else>
                <WalletsPageListItem
                  v-for="walletId in content.ids"
                  :key="walletId"
                  :walletId
                  @delete="requestDelete"
                />
              </template>
            </UiToggleControlled>
          </div>
        </div>
      </div>
    </div>
  </UiPage>

  <LayoutConfirmModal
    v-if="deleteWalletId"
    :title="t('wallets.form.delete.title')"
    :description="deleteInfo.descText"
    :highlight="deleteInfo.highlight"
    @closed="cancelDelete"
    @confirm="confirmDelete"
  />

  <!-- Sort Modal -->
  <WalletsSortModal v-if="isSortModalOpen" @close="isSortModalOpen = false" />
</template>
