<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { $i18n } = useNuxtApp()
const route = useRoute()
const router = useRouter()
const walletsStore = useWalletsStore()

const walletId = computed(() => route.params.id as WalletId)
const wallet = computed(() => walletsStore.items[walletId.value])

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
      <router-link v-slot="{ href, navigate }" to="/wallets" custom>
        <a class="grow hocus_bg-item-5" :href="href" @click="navigate">
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
                class="flex-center rounded p-1 text-2xs text-icon-primary"
              >
                {{ wallet.currency }}
              </div>
            </div>
          </UiHeaderTitle2>
        </a>
      </router-link>

      <template #actions>
        <UiHeaderLink @click="onEditClick">
          <Icon
            name="mdi:pencil-outline"
            size="22"
            class="group-hover_text-white"
          />
        </UiHeaderLink>
      </template>
    </UiHeader>

    <div class="px-2">
      <div class="flex mb-6 pt-3">
        <Amount
          :amount="total"
          :currencyCode="wallet.currency"
          variant="3xl"
        />
      </div>

      <div
        v-if="wallet.description"
        class="mb-6 text-sm text-item-2"
      >
        {{ wallet.description }}
      </div>

      <div class="pt-4">
        <StatMini
          :walletsIds="[walletId]"
        />
      </div>
    </div>
  </UiPage>
</template>

<i18n lang="yaml">
en:
  statBy: Statistics

ru:
  statBy: Статистика
</i18n>
