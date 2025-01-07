<script setup lang="ts">
import type { WalletId, WalletItem } from '~/components/wallets/types'

import { normalizeWalletItem } from '~/components/wallets/utils'

const { t } = useI18n()
const router = useRouter()
const walletForm = ref(normalizeWalletItem())

function updateValue(id: WalletId, value: WalletItem[keyof WalletItem]) {
  walletForm.value[id] = value
}

function afterSave() {
  router.replace('/wallets')
}

useHead({
  title: `${t('base.add')}: ${walletForm.value.name ? walletForm.value.name : t('wallets.form.name.label')}`,
})
</script>

<template>
  <UiPage class="flex h-full flex-col">
    <UiHeader>
      <UiHeaderTitle>{{ t('wallets.createNewTitle') }}</UiHeaderTitle>
    </UiHeader>

    <WalletsForm
      :walletForm="walletForm"
      @afterSave="afterSave"
      @updateValue="updateValue"
    />
  </UiPage>
</template>
