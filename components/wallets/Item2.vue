<script setup lang="ts">
import { useWalletsStore } from '../wallets/useWalletsStore'
import { getStyles } from '~/components/ui/getStyles'
import type { WalletId } from '~/components/wallets/types'

const props = defineProps<{
  walletId: WalletId
}>()

const emit = defineEmits<{
  click: [walletId: WalletId]
  filter: [walletId: WalletId]
}>()
const walletsStore = useWalletsStore()

const wallet = computed(() => walletsStore.sortedItems[props.walletId])
</script>

<template>
  <div
    :class="getStyles('item', ['link', 'center', 'gap1', 'rounded', 'padding2', 'minh'])"
    @click="emit('click', props.walletId)"
  >
    <div class="flex-center gap-x-3 text-secondary2">
      <UiIconWalletWithdrawal
        v-if="wallet.countTotal"
        :style="{ color: wallet.color }"
        class="h-4 w-4 text-item-2"
      />
      <UiIconWalletSavings
        v-else-if="!wallet.countTotal && !wallet.isCredit"
        :style="{ color: wallet.color }"
        class="h-4 w-4 text-item-2"
      />
      <div v-else class="flex-center w-4">
        <WalletsIcon2
          :color="wallet.color"
          :name="wallet.name"
          :walletId
          @click.stop="emit('filter', props.walletId)"
        />
      </div>

      <div class="grow">
        <div class="text-2xs">
          <Amount
            :amount="wallet.amount"
            :currencyCode="wallet.currency"
            :isShowBaseRate="false"
            align="left"
          />
        </div>
        <div class="text-secondary text-sm leading-none">
          {{ wallet.name }}
        </div>
      </div>
    </div>
  </div>
</template>
