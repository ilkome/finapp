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
// vueuse types a binding as a prop option, so a function type must stay `any`.
const [DefineBody, ReuseBody] = createReusableTemplate<{ close: any }>()
const isLaptop = useIsLaptop()
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
  <DefineBody v-slot="{ close }">
    <WalletsForm
      :walletId="props.walletId"
      :walletForm
      @update="updateField"
      @afterSave="close"
    />
  </DefineBody>

  <UModal
    v-if="isLaptop"
    defaultOpen
    :title="wallet?.name || t('wallets.createNewTitle')"
    :ui="{ content: 'max-w-lg' }"
    @after:leave="emit('closed')"
  >
    <template #body="{ close }">
      <ReuseBody :close />
    </template>
  </UModal>

  <Drawer
    v-else
    :title="wallet?.name || t('wallets.createNewTitle')"
    contentClass="min-h-[50dvh]"
    @closed="emit('closed')"
  >
    <template #default="{ close }">
      <ReuseBody :close />
    </template>
  </Drawer>
</template>
