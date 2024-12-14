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
  return router.replace(`/wallets/${walletId.value}`)
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
      <UiHeaderTitle>
        {{ t("base.edit") }}:
        {{ walletForm.name ? walletForm.name : t("wallets.form.name.label") }}
      </UiHeaderTitle>

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
