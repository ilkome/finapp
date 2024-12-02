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
      <UiHeaderTitle>
        <div class="text-item-2 pb-1 text-xs font-medium">
          {{ t("wallets.createNewTitle") }}
        </div>
        <div class="flex items-center gap-3">
          <div class="text-item-1 text-2xl font-semibold">
            {{ walletForm.name ? walletForm.name : t("wallets.form.name.label") }}
          </div>
          <div class="flex-center text-icon-primary text-2xs rounded-lg p-1" :style="{ background: walletForm.color }">
            {{ walletForm.currency }}
          </div>
        </div>
      </UiHeaderTitle>
    </UiHeader>

    <WalletsForm
      :walletForm="walletForm"
      @afterSave="afterSave"
      @updateValue="updateValue"
    />
  </UiPage>
</template>
