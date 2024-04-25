<script setup lang="ts">
import type { WalletId, WalletItemWithAmount } from '~/components/wallets/types'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  activeItemId?: WalletId
  wallet: WalletItemWithAmount
  walletId: WalletId
  isShowIcons?: boolean
}>()

const emit = defineEmits<{
  click: [walletId: WalletId]
  filter: [walletId: WalletId]
}>()
</script>

<template>
  <div class="group" @click="emit('click', props.walletId)">
    <div
      :class="[
        { '!bg-item-3': activeItemId === props.walletId },
        ...getStyles('item', ['link', 'rounded', 'padding1', 'minh']),
      ]"
      class="-my-[1px] flex items-center gap-2"
    >
      <div class="flex grow items-center gap-3 overflow-hidden pl-1">
        <template v-if="isShowIcons">
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
        </template>

        <div v-if="!isShowIcons" class="px-1">
          <WalletsIcon2
            :color="wallet.color"
            :name="wallet.name"
            :walletId
            @click.stop="emit('filter', props.walletId)"
          />
        </div>

        <div class="text-item-base text-sm leading-none">
          {{ wallet.name }}
        </div>
      </div>

      <div class="text-item-base grow pr-1">
        <Amount
          :amount="wallet.amount"
          :currencyCode="wallet.currency"
          :isShowBaseRate="false"
          size="base"
          class="opacity-90"
        />
      </div>
    </div>

    <div
      class="ml-9 mr-2 h-[1px] bg-item-5 group-last_hidden"
      :class="{ 'ml-9': isShowIcons, 'ml-7': !isShowIcons }"
    />
  </div>
</template>
