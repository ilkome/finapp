<script setup lang="ts">
import type { WalletForm, WalletId } from '~/components/wallets/types'

import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { normalizeWalletItem } from '~/components/wallets/utils'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const walletsStore = useWalletsStore()

const walletId = computed(() => route.params.id) as Ref<WalletId>
const wallet = computed(() => walletsStore.items?.[walletId.value])
const walletForm = ref(normalizeWalletItem(wallet.value))

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
      @updateValue="(key: keyof WalletForm, newValue: any) => walletForm[key] = newValue"
    />
  </UiPage>
</template>
