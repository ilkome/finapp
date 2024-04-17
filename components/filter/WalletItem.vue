<script setup lang="ts">
import { useWalletsStore } from '../wallets/useWalletsStore'
import type { WalletId } from '~/components/wallets/types'

const props = defineProps<{
  walletId: WalletId
}>()

const emit = defineEmits<{
  click: [walletId: WalletId]
}>()
const walletsStore = useWalletsStore()

const wallet = computed(() => walletsStore.walletsItemsSorted[props.walletId])
</script>

<template>
  <FilterItemBg @click="emit('click', props.walletId)">
    <div class="flex-center gap-x-3 text-secondary2">
      <WalletsIcon
        :color="wallet.color"
        :name="wallet.name"
        :walletId="props.walletId"
      />

      <div class="grow">
        <div class="text-sm leading-none">
          {{ wallet.name }}
        </div>

        <div class="text-item-base">
          <Amount
            :amount="wallet.amount"
            :currencyCode="wallet.currency"
            :isShowBaseRate="false"
            align="left"
          />
        </div>
      </div>
    </div>
  </FilterItemBg>
</template>
