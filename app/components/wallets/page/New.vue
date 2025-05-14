<script setup lang="ts">
import type { WalletForm, WalletItem } from '~/components/wallets/types'

import { normalizeWalletItem } from '~/components/wallets/utils'

const { t } = useI18n()
const router = useRouter()
const walletForm = ref(normalizeWalletItem())

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
      @afterSave="() => router.replace('/wallets')"
      @updateValue="(id: keyof WalletForm, value: WalletItem[keyof WalletItem]) => walletForm[id] = value"
    />
  </UiPage>
</template>
