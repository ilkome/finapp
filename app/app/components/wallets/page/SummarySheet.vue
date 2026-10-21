<script setup lang="ts">
import { useCountedWalletIds } from '~/components/wallets/analytics/useAnalyticsBase'

const emit = defineEmits<{
  closed: []
}>()

const { t } = useI18n()
const { walletIds } = useCountedWalletIds()
const shares = useTemplateRef('shares')
</script>

<template>
  <UiSheet
    :title="t('wallets.analytics.summary')"
    :collapsedSnap="500"
    modalClass="sm:max-w-md"
    @closed="emit('closed')"
  >
    <template #titleActions>
      <WalletsAnalyticsSettingsMenu
        v-if="shares"
        :options="shares.settings"
        :title="t('wallets.analytics.shares.title')"
        @change="(id, value) => shares?.onSetting(id, value)"
      />
    </template>

    <div class="pb-6">
      <WalletsAnalyticsSharesSection ref="shares" :walletIds isHeaderless />
    </div>
  </UiSheet>
</template>
