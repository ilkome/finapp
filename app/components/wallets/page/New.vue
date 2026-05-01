<script setup lang="ts">
import type { WalletItem } from '~/components/wallets/types'

import { walletItemSchema } from '~/components/wallets/types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const walletForm = ref(walletItemSchema.parse({ type: 'cash' }))

const isOnboarding = computed(() => 'onboarding' in route.query)

function updateField(key: keyof WalletItem, value: WalletItem[keyof WalletItem]) {
  (walletForm.value as Record<string, unknown>)[key] = value
}

useHead({
  title: `${t('base.add')}: ${walletForm.value.name ? walletForm.value.name : t('wallets.form.name.label')}`,
})
</script>

<template>
  <UiPage class="flex h-full flex-col">
    <h1
      v-if="isOnboarding"
      class="pt-2 pb-6 text-center text-2xl font-bold"
    >
      {{ t('wallets.createNewTitle') }}
    </h1>

    <UiHeader
      v-else
      hideSearch
      backTo="wallets"
    >
      <UiHeaderTitle>
        {{ t('wallets.createNewTitle') }}
      </UiHeaderTitle>
    </UiHeader>

    <WalletsForm
      :walletForm="walletForm"
      @afterSave="() => router.replace('/dashboard')"
      @update="updateField"
    />
  </UiPage>
</template>
