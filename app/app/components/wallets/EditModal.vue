<script setup lang="ts">
import type { WalletFormKey, WalletId } from '~/components/wallets/types'

import { walletItemSchema } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  walletId?: WalletId
}>()

const emit = defineEmits<{
  closed: []
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()

const wallet = computed(() =>
  props.walletId ? walletsStore.items?.[props.walletId] : undefined,
)
const walletForm = ref(
  wallet.value
    ? walletItemSchema.parse(wallet.value)
    : walletItemSchema.parse({ type: 'cash' }),
)

function updateField(key: WalletFormKey, value: unknown) {
  (walletForm.value as Record<string, unknown>)[key] = value
}
</script>

<template>
  <BottomSheetOrModal isBare :title="wallet?.name || t('wallets.createNewTitle')" @closed="emit('closed')">
    <template #default="{ close }">
      <WalletsForm
        :walletId="props.walletId"
        :walletForm
        @update="updateField"
        @afterSave="close"
      />
    </template>
  </BottomSheetOrModal>
</template>
