<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletsCurrencyFiltered } from '~/components/wallets/types'

const props = defineProps<{
  currenciesUsed: CurrencyCode[]
  currencyFiltered: WalletsCurrencyFiltered
}>()

const emit = defineEmits<{
  select: [code: WalletsCurrencyFiltered]
}>()

const { t } = useI18n()
const isOpen = ref(false)

function onSelect(code: WalletsCurrencyFiltered, close: () => void) {
  emit('select', code)
  close()
}
</script>

<template>
  <UiTriggerButton
    :hasSelection="props.currencyFiltered !== 'all'"
    icon="lucide:coins"
    :title="t('wallets.currency.title')"
    @click="isOpen = true"
  />

  <UiSheet v-if="isOpen" :title="t('wallets.currency.title')" modalClass="sm:max-w-sm" @closed="isOpen = false">
    <template #default="{ close }">
      <div class="grid grid-cols-3 gap-2 pb-3">
        <UButton
          v-for="code in ['all', ...props.currenciesUsed]"
          :key="code"
          class="justify-center rounded-md"
          :color="props.currencyFiltered === code ? 'primary' : 'neutral'"
          :variant="props.currencyFiltered === code ? 'solid' : 'soft'"
          @click="onSelect(code as WalletsCurrencyFiltered, close)"
        >
          {{ code === 'all' ? t('common.all') : code }}
        </UButton>
      </div>
    </template>
  </UiSheet>
</template>
