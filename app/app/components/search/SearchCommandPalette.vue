<script setup lang="ts">
import type { SearchResultItem } from '~/components/search/useSearch'
import type { TransactionFull, TransferFull, TrnItemFull } from '~/components/trns/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useSearch } from '~/components/search/useSearch'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  class?: string
}>()

const emit = defineEmits<{
  select: [item: SearchResultItem]
}>()

const { t } = useI18n()
const { groups, searchTerm } = useSearch()
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()
const trnsStore = useTrnsStore()

function getCategory(item: SearchResultItem) {
  return categoriesStore.items?.[item.entityId]
}

function getCategoryParent(item: SearchResultItem) {
  const cat = getCategory(item)
  if (cat?.parentId)
    return categoriesStore.items?.[cat.parentId]
}

function getWallet(item: SearchResultItem) {
  return walletsStore.items?.[item.entityId]
}

function getTrn(item: SearchResultItem) {
  return trnsStore.computeTrnItem(item.entityId)
}

function isTransaction(trn: TrnItemFull): trn is TransactionFull {
  return trn.type !== TrnType.Transfer
}

function isTransfer(trn: TrnItemFull): trn is TransferFull {
  return trn.type === TrnType.Transfer
}

function getTransaction(item: SearchResultItem): TransactionFull | undefined {
  const trn = getTrn(item)
  return trn && isTransaction(trn) ? trn : undefined
}

function getTransfer(item: SearchResultItem): TransferFull | undefined {
  const trn = getTrn(item)
  return trn && isTransfer(trn) ? trn : undefined
}
</script>

<template>
  <!-- @vue-ignore -->
  <UCommandPalette
    v-model:searchTerm="searchTerm"
    :groups="groups"
    :placeholder="t('search.placeholder')"
    :fuse="{
      resultLimit: 50,
      fuseOptions: {
        threshold: 0.4,
        keys: ['label', 'suffix', 'search'],
      },
    }"
    :class="props.class"
    @update:modelValue="emit('select', $event)"
  >
    <!-- Menu -->
    <template #menu-item="{ item: rawItem }">
      <div class="flex w-full items-center gap-3">
        <Icon :name="(rawItem as SearchResultItem).icon" size="20" class="text-muted" />
        <div class="text-sm">
          {{ (rawItem as SearchResultItem).label }}
        </div>
      </div>
    </template>

    <!-- Category -->
    <template #category-item="{ item: rawItem }">
      <div class="flex w-full items-center gap-3">
        <UiIconBase
          :color="getCategory(rawItem as SearchResultItem)?.color"
          :name="getCategory(rawItem as SearchResultItem)?.icon ?? ''"
          invert
        />
        <CategoriesName
          v-if="getCategory(rawItem as SearchResultItem)"
          :category="getCategory(rawItem as SearchResultItem)!"
          :parentCategory="getCategoryParent(rawItem as SearchResultItem)"
          isShowParent
          stacked
        />
      </div>
    </template>

    <!-- Wallet -->
    <template #wallet-item="{ item: rawItem }">
      <div class="flex w-full items-center gap-3 text-start">
        <WalletsIcon
          :color="getWallet(rawItem as SearchResultItem)?.color ?? ''"
          :name="getWallet(rawItem as SearchResultItem)?.name ?? ''"
        />
        <div class="grid grow gap-1">
          <div class="text-toned text-sm leading-none font-medium tracking-wide text-nowrap">
            {{ getWallet(rawItem as SearchResultItem)?.name }}
          </div>
          <div
            v-if="getWallet(rawItem as SearchResultItem)?.desc"
            class="text-2xs text-muted leading-none"
          >
            {{ getWallet(rawItem as SearchResultItem)?.desc }}
          </div>
        </div>
      </div>
    </template>

    <!-- Transaction -->
    <template #trn-item="{ item: rawItem }">
      <div
        v-if="getTrn(rawItem as SearchResultItem)"
        class="flex w-full items-start gap-3 text-start"
      >
        <div class="flex-center min-w-8">
          <UiIconBase
            :name="getTrn(rawItem as SearchResultItem)?.category?.icon ?? ''"
            :color="getTrn(rawItem as SearchResultItem)?.category?.color"
            invert
          />
        </div>

        <div class="grid grow gap-1 pr-1">
          <div class="flex grow items-center gap-3">
            <!-- Regular transaction -->
            <template v-if="getTransaction(rawItem as SearchResultItem)">
              <div class="grid grow gap-0.5">
                <CategoriesName
                  :category="getTransaction(rawItem as SearchResultItem)!.category"
                  :parentCategory="getTransaction(rawItem as SearchResultItem)!.categoryParent"
                  isShowParent
                  stacked
                />
                <div class="flex items-center gap-2">
                  <div class="text-2xs text-muted leading-none">
                    {{ getTransaction(rawItem as SearchResultItem)?.wallet?.name }}
                  </div>
                </div>
              </div>

              <Amount
                :amount="getTransaction(rawItem as SearchResultItem)!.amount"
                :currencyCode="getTransaction(rawItem as SearchResultItem)!.wallet.currency"
                :isShowMinus="getTransaction(rawItem as SearchResultItem)?.type === TrnType.Expense"
                :isShowPlus="getTransaction(rawItem as SearchResultItem)?.type === TrnType.Income"
                :type="getTransaction(rawItem as SearchResultItem)!.type"
                align="right"
                class="grow"
                colorize="income"
                variant="sm"
              />
            </template>

            <!-- Transfer -->
            <div
              v-if="getTransfer(rawItem as SearchResultItem)"
              class="grid gap-1"
            >
              <div class="text-toned flex items-center gap-1 text-sm leading-none">
                <span class="font-semibold">{{ getTransfer(rawItem as SearchResultItem)?.expenseWallet?.name }}</span>
                <Icon name="lucide:move-right" size="16" />
                <span class="font-semibold">{{ getTransfer(rawItem as SearchResultItem)?.incomeWallet?.name }}</span>
              </div>

              <div class="flex flex-wrap gap-2">
                <Amount
                  :amount="getTransfer(rawItem as SearchResultItem)!.expenseAmount"
                  :colorize="getTransfer(rawItem as SearchResultItem)?.incomeAmount === getTransfer(rawItem as SearchResultItem)?.expenseAmount ? undefined : 'expense'"
                  :currencyCode="getTransfer(rawItem as SearchResultItem)!.expenseWallet.currency"
                  :type="TrnType.Expense"
                  class="!flex items-center gap-2"
                  variant="sm"
                />

                <template v-if="getTransfer(rawItem as SearchResultItem)?.incomeAmount !== getTransfer(rawItem as SearchResultItem)?.expenseAmount">
                  <Amount
                    :amount="getTransfer(rawItem as SearchResultItem)!.incomeAmount"
                    :currencyCode="getTransfer(rawItem as SearchResultItem)!.incomeWallet.currency"
                    :type="TrnType.Income"
                    colorize="income"
                    class="!flex items-center gap-2"
                    variant="sm"
                  />
                </template>
              </div>
            </div>
          </div>

          <div
            v-if="getTrn(rawItem as SearchResultItem)?.desc"
            class="text-2xs opacity-80"
          >
            {{ getTrn(rawItem as SearchResultItem)?.desc }}
          </div>
        </div>
      </div>
    </template>
  </UCommandPalette>
</template>
