<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletsCurrencyFiltered } from '~/components/wallets/types'

import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  currencyFiltered: WalletsCurrencyFiltered
  menuStyle?: boolean
}>()

const emit = defineEmits<{
  selectFilterCurrency: [code: CurrencyCode]
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()

const items = computed<TabsItem[]>(() => [
  { label: t('common.all'), value: 'all' },
  ...walletsStore.currenciesUsed.map(currency => ({ label: currency, value: currency })),
])
</script>

<template>
  <div
    v-if="props.menuStyle"
    class="h-9 w-max min-w-max overflow-hidden rounded-full border border-default/80 bg-default/20 shadow-lg backdrop-blur-xl dark:bg-neutral-800/50"
  >
    <UiTabs
      class="h-full w-max min-w-max overflow-visible! px-3 *:h-full"
      :itemGrow="false"
      :items="items"
      :modelValue="props.currencyFiltered"
      variant="text"
      @update:modelValue="(v) => emit('selectFilterCurrency', v as CurrencyCode)"
    />
  </div>

  <div
    v-else
    class="-mx-2 scroll-strip flex min-w-0 snap-x snap-mandatory scroll-px-2 items-center overflow-x-auto px-2 py-px lg:-mx-4 lg:scroll-px-4 lg:px-4 2xl:-mx-8 2xl:scroll-px-8 2xl:px-8"
  >
    <UiTabs
      class="shrink-0 overflow-visible! bg-transparent! p-0!"
      itemClass="snap-start snap-always"
      :itemGrow="false"
      :items="items"
      :modelValue="props.currencyFiltered"
      size="xs"
      @update:modelValue="(v) => emit('selectFilterCurrency', v as CurrencyCode)"
    />
  </div>
</template>
