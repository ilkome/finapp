<script setup lang="ts">
import type { WalletId, WalletItem } from '~/components/wallets/types'

import { walletItemSchema } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const walletsStore = useWalletsStore()

const walletId = computed(() => route.params.id) as Ref<WalletId>
const wallet = computed(() => walletsStore.items?.[walletId.value])
const walletForm = ref(walletItemSchema.parse(wallet.value))

useHead({ title: `${t('base.edit')}: ${walletForm.value?.name || t('wallets.form.name.label')}` })
</script>

<template>
  <UiPage
    v-if="wallet"
    class="flex h-full flex-col"
  >
    <UiHeader>
      <UiHeaderTitle>
        {{ t('base.edit') }}:
        {{ walletForm.name ? walletForm.name : t('wallets.form.name.label') }}
      </UiHeaderTitle>
    </UiHeader>

    <WalletsForm
      :walletId
      :walletForm
      @afterSave="() => router.replace(`/wallets/${walletId}`)"
      @updateValue="(key: keyof WalletItem, value: WalletItem[keyof WalletItem]) => walletForm[key] = value"
    />
  </UiPage>
</template>
