<script setup lang="ts">
import type { WalletId, WalletItem } from '~/components/wallets/types'

import { walletItemSchema } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { canGoBack, navigateAfterSave } from '~/composables/useNavigationHistory'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const walletsStore = useWalletsStore()

const walletId = computed(() => route.params.id) as Ref<WalletId>
const wallet = computed(() => walletsStore.items?.[walletId.value])

const walletForm = ref<WalletItem | undefined>(
  wallet.value ? walletItemSchema.parse(wallet.value) : undefined,
)

// On a hard reload of /wallets/{id}/edit the store is still empty for a tick, so
// redirecting synchronously would bounce a valid id to the list (hydration race).
// `items` is null until at least one wallet has loaded, so wait for it: seed the
// form once the wallet appears, and only redirect once the store has hydrated
// (items truthy) but this id is genuinely absent.
watch(
  () => walletsStore.items,
  (items) => {
    if (wallet.value) {
      if (!walletForm.value)
        walletForm.value = walletItemSchema.parse(wallet.value)
    }
    else if (items) {
      router.replace('/wallets')
    }
  },
  { immediate: true },
)

function updateField(key: keyof WalletItem, value: WalletItem[keyof WalletItem]) {
  if (walletForm.value)
    (walletForm.value as Record<string, unknown>)[key] = value
}

function onAfterSave() {
  if (route.query.returnBack === '1' && canGoBack.value)
    router.back()
  else
    navigateAfterSave(router, `/wallets/${walletId.value}`)
}

useHead({ title: computed(() => `${t('base.edit')}: ${walletForm.value?.name || t('wallets.form.name.label')}`) })
</script>

<template>
  <UiPage
    v-if="wallet && walletForm"
    class="flex h-full flex-col"
  >
    <UiHeader :backTo="`/wallets/${walletId}`">
      <UiHeaderTitle>
        {{ t('base.edit') }}:
        {{ walletForm.name ? walletForm.name : t('wallets.form.name.label') }}
      </UiHeaderTitle>
    </UiHeader>

    <WalletsForm
      :walletId
      :walletForm
      @afterSave="onAfterSave"
      @update="updateField"
    />
  </UiPage>
</template>
