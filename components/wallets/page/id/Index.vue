<script setup lang="ts">
import dayjs from 'dayjs'
import type { WalletId } from '~/components/wallets/types'
import { useFilter } from '~/components/filter/useFilter'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { getTrnsIds } from '~/components/trns/getTrns'

const { t } = useI18n()
const { $i18n } = useNuxtApp()
const route = useRoute()
const router = useRouter()
const filterStore = useFilter()
const walletsStore = useWalletsStore()
const trnsStore = useTrnsStore()

const walletId = computed(() => route.params.id as WalletId)
const wallet = computed(() => walletsStore.items[walletId.value])

if (!wallet.value)
  router.replace('/wallets')

const total = computed(() => walletsStore.walletsTotal[walletId.value])

const trnsIds = computed(() =>
  getTrnsIds({
    walletsIds: [walletId.value],
    trnsItems: trnsStore.items,
  }),
)

// TODO: useFilter
function onClickFilterWallet() {
  filterStore.setFilterWalletStat(walletId.value)
}

function onEditClick() {
  router.push(`/wallets/${walletId.value}/edit`)
}

useHead({
  title: `${$i18n.t('wallets.title')}: ${wallet.value?.name}`,
})
</script>

<template>
  <UiPage v-if="wallet">
    <UiHeader>
      <router-link v-slot="{ href, navigate }" to="/wallets" custom>
        <a class="grow hocus_bg-item-5" :href="href" @click="navigate">
          <UiHeaderTitle>
            <div class="pt-1 text-xs font-medium text-item-2">
              {{ $t("wallets.title") }}
            </div>
            <div class="flex items-center gap-3 pb-1">
              <div class="text-2xl font-semibold text-item-1">
                {{ wallet.name }}
              </div>
              <div
                :style="{ background: wallet.color }"
                class="flex-center rounded p-1 text-2xs text-icon-primary"
              >
                {{ wallet.currency }}
              </div>
            </div>
          </UiHeaderTitle>
        </a>
      </router-link>
      <template #actions>
        <UiHeaderLink @click="onEditClick">
          <div class="mdi mdi-pencil-outline text-xl group-hover_text-white" />
        </UiHeaderLink>
      </template>
    </UiHeader>

    <div class="mb-6 flex px-2 pt-3 text-3xl">
      <Amount :amount="total" :currencyCode="wallet.currency" />
    </div>

    <div v-if="wallet.description" class="mb-6 px-2 text-sm text-item-2">
      {{ wallet.description }}
    </div>

    <div class="mb-6 flex px-2">
      <UiItemShadow
        class="flex cursor-pointer items-center gap-3 p-1 px-2"
        @click="onClickFilterWallet"
      >
        <div class="mdi mdi-poll text-xl" />

        <div class="text-xs leading-none">
          {{ t("statBy") }}: {{ wallet.name }}
        </div>

        <div class="mdi mdi-chevron-right text-lg leading-none opacity-70" />
      </UiItemShadow>
    </div>

    <!-- Stat -->
    <div class="px-2">
      <StatChartStat :walletsIds="[walletId]" />
    </div>
  </UiPage>
</template>

<i18n lang="yaml">
en:
  statBy: Statistics

ru:
  statBy: Статистика
</i18n>
