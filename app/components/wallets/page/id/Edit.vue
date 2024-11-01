<script setup lang="ts">
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import type { WalletItem } from '~/components/wallets/types'
import { normalizeWalletItem } from '~/components/wallets/utils'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const walletsStore = useWalletsStore()

const walletId = computed(() => route.params.id)
const wallet = computed(() => walletsStore.items?.[walletId.value])
const walletForm = ref(normalizeWalletItem(wallet.value))

function updateValue(id: keyof WalletItem, value: WalletItem[keyof WalletItem]) {
  walletForm.value[id] = value
}

function afterSave() {
  return router.push(`/wallets/${walletId.value}`)
}

useHead({
  title: `${t('base.edit')}: ${
    walletForm.value?.name
      ? walletForm.value?.name
      : t('wallets.form.name.label')
  }`,
})
</script>

<template>
  <UiPage
    v-if="wallet"
    class="flex h-full flex-col"
  >
    <UiHeader>
      <RouterLink
        v-slot="{ href, navigate }"
        :to="`/wallets/${walletId}`"
        custom
      >
        <a class="hocus:bg-item-5 grow" :href="href" @click="navigate">
          <UiHeaderTitle>
            <div class="text-item-2 pb-1 text-xs font-medium">
              {{ t("wallets.editTitle") }}
            </div>
            <div class="flex items-center gap-3">
              <div class="text-item-1 text-2xl font-semibold">
                {{ walletForm.name ? walletForm.name : t("wallets.form.name.label") }}
              </div>
              <div
                class="flex-center text-2xs text-icon-primary rounded-lg p-1"
                :style="{ background: walletForm.color }"
              >
                {{ walletForm.currency }}
              </div>
            </div>
          </UiHeaderTitle>
        </a>
      </RouterLink>

      <template #actions>
        <WalletsDelete :walletId="walletId" />
      </template>
    </UiHeader>

    <WalletsForm
      :walletId="walletId"
      :walletForm="walletForm"
      @afterSave="afterSave"
      @updateValue="updateValue"
    />
  </UiPage>
</template>
