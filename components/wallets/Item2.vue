<script setup lang="ts">
import type {
  WalletId,
  WalletItemWithAmount,
} from '~/components/wallets/types'

defineProps<{
  wallet: WalletItemWithAmount
  walletId: WalletId
  isShowIcons?: boolean
}>()

const emit = defineEmits<{
  click: []
  filter: []
}>()
</script>

<template>
  <div class="group" @click="emit('click')">
    <div
      class="-my-[1px] flex min-h-[42px] items-center rounded-md px-2 py-1.5 text-secondary2 hocus_bg-item-5"
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
              @click.stop="emit('filter')"
            />
          </div>
        </template>

        <div v-if="!isShowIcons" class="px-1">
          <WalletsIcon2
            :color="wallet.color"
            :name="wallet.name"
            :walletId
            @click.stop="emit('filter')"
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
