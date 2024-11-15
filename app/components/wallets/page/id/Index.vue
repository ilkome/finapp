<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'
import { useFilter } from '~/components/filter/useFilter'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { icons } from '~/components/wallets/types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const walletsStore = useWalletsStore()
const trnsStore = useTrnsStore()

const filter = useFilter()
provide('filter', filter)

const walletId = computed(() => route.params.id as WalletId)
const wallet = computed(() => walletsStore.items?.[walletId.value])
const statConfig = useStatConfig({ storageKey: walletId.value })
provide('statConfig', statConfig)

if (!wallet.value)
  router.replace('/wallets')

const total = computed(() => walletsStore.itemsWithAmount[walletId.value]?.amount ?? 0)

function onEditClick() {
  router.push(`/wallets/${walletId.value}/edit`)
}

useHead({
  title: `${t('wallets.title')}: ${wallet.value?.name}`,
})

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: filter?.catsIds?.value ?? [],
  walletsIds: [walletId.value, ...filter?.walletsIds?.value],
}, {
  includesChildCategories: true,
}))
</script>

<template>
  <UiPage v-if="wallet">
    <UiHeader class="bg-foreground-3">
      <RouterLink v-slot="{ href, navigate }" to="/wallets" custom>
        <a
          class="hocus:bg-item-5 -mx-2 grow cursor-default overflow-hidden rounded-lg px-2"
          :href="href"
          @click="navigate"
        >
          <UiHeaderTitle class="flex items-center gap-2 px-2">
            <Icon
              :name="icons[wallet.type]"
              :style="{ color: wallet.color }"
              class="size-6"
            />
            <div class="text-item-1 text-xl font-semibold">
              {{ wallet.name }}
            </div>
          </UiHeaderTitle>
        </a>
      </RouterLink>

      <template #actions>
        <UiHeaderLink @click="onEditClick">
          <Icon
            name="mdi:pencil-outline"
            size="22"
            class="group-hover:text-white"
          />
        </UiHeaderLink>

        <StatConfigPopover />
      </template>
    </UiHeader>

    <div v-if="trnsIds.length > 0">
      <div class="px-2 md:px-6">
        <div class="pt-2 lg:px-4">
          <FilterSelector isHideWallets class="pb-2" />
          <FilterSelected
            v-if="filter.isShow?.value"
            isShowCategories
            isShowWallets
          />

          <div
            v-if="wallet.type !== 'credit'"
            class="md:max-w-lg"
          >
            <StatSum2
              :amount="total"
              :title="t('money.balance')"
            />
          </div>

          <div v-if="wallet.creditLimit" class="grid grid-cols-3 gap-1 md:max-w-lg">
            <StatSum2
              :amount="total"
              :title="t('wallets.form.credit.debt')"
            />
            <StatSum2
              :amount="wallet.creditLimit - (-total)"
              :title="t('wallets.form.credit.available')"
            />
            <StatSum2
              :amount="wallet.creditLimit"
              :title="t('wallets.form.credit.limit')"
            />
          </div>
        </div>

        <div
          v-if="wallet.description"
          class="text-item-2 mb-6 text-sm"
        >
          {{ wallet.description }}
        </div>
      </div>

      <div class="px-2 pt-2 md:px-6">
        <StatItem
          :storageKey="walletId"
          :trnsIds
          isShowTotals
          type="sum"
        />
      </div>
    </div>

    <div v-else class="pageWrapper">
      <TrnsNoTrns />
    </div>
  </UiPage>
</template>
