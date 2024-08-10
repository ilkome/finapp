<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'
import { useFilter } from '~/components/filter/useFilter'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const filter = useFilter()
provide('filter', filter)

const { $i18n } = useNuxtApp()
const route = useRoute()
const router = useRouter()
const walletsStore = useWalletsStore()
const trnsStore = useTrnsStore()

const walletId = computed(() => route.params.id as WalletId)
const wallet = computed(() => walletsStore.items?.[walletId.value])

if (!wallet.value)
  router.replace('/wallets')

const total = computed(() => walletsStore.totals[walletId.value])

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
      <RouterLink v-slot="{ href, navigate }" to="/wallets" custom>
        <a class="grow hocus:bg-item-5" :href="href" @click="navigate">
          <UiHeaderTitle2>
            <div class="pt-3 text-xs font-medium text-item-2">
              {{ $t("wallets.title") }}
            </div>
            <div class="flex items-center gap-3 pb-1">
              <div class="text-2xl font-semibold text-item-1">
                {{ wallet.name }}
              </div>
              <div
                :style="{ background: wallet.color }"
                class="flex-center rounded-lg p-1 text-2xs text-icon-primary"
              >
                {{ wallet.currency }}
              </div>
            </div>
          </UiHeaderTitle2>
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
      </template>
    </UiHeader>

    <div class="px-2">
      <div class="flex flex-wrap justify-stretch gap-1 px-2 pt-2 lg:px-4 xl:px-16">
        <template v-if="!wallet.isCredit">
          <Amount
            :amount="total"
            :currencyCode="wallet.currency"
            variant="xl"
          />
        </template>

        <template v-if="wallet.creditLimit">
          <StatSum2
            :amount="total"
            :title="$t('wallets.form.credit.debt')"
          />
          <StatSum2
            :amount="wallet.creditLimit - (-total)"
            :title="$t('wallets.form.credit.available')"
          />
          <StatSum2
            :amount="wallet.creditLimit"
            :title="$t('wallets.form.credit.limit')"
          />
        </template>
      </div>

      <div
        v-if="wallet.description"
        class="mb-6 text-sm text-item-2"
      >
        {{ wallet.description }}
      </div>
    </div>

    <div class="px-2 pt-2 lg:px-4 xl:px-16">
      <StatMiniItem
        type="sum"
        :trnsIds="trnsStore.getStoreTrnsIds({
          walletsIds: [walletId, ...filter?.walletsIds?.value],
        })"
        :storageKey="walletId"
        isShowTotals
      />
    </div>
  </UiPage>
</template>
