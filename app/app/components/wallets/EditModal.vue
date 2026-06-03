<script setup lang="ts">
import type { WalletId, WalletItem } from '~/components/wallets/types'

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

function updateField(key: keyof WalletItem, value: WalletItem[keyof WalletItem]) {
  (walletForm.value as Record<string, unknown>)[key] = value
}
</script>

<template>
  <BottomSheetModal @closed="emit('closed')">
    <template #default="{ close }">
      <UiTitleModal>
        {{ wallet?.name || t('wallets.createNewTitle') }}
      </UiTitleModal>

      <WalletsForm
        :walletId="props.walletId"
        :walletForm
        @update="updateField"
        @afterSave="close"
      />
    </template>
  </BottomSheetModal>
</template>
