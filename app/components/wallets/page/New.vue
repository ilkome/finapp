<script setup lang="ts">
import type { WalletItem } from '~/components/wallets/types'

import { walletItemSchema } from '~/components/wallets/types'

const { t } = useI18n()
const router = useRouter()
const walletForm = ref(walletItemSchema.parse({ type: 'cash' }))

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
      @updateValue="(id: keyof WalletItem, value: WalletItem[keyof WalletItem]) => walletForm[id] = value"
    />
  </UiPage>
</template>
