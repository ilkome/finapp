<script setup lang="ts">
import type { MoneyTypeSlug } from '~/components/stat/types'
import type { WalletId } from '~/components/wallets/types'
import { type TransferType, TrnType } from '~/components/trns/types'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { getStyles } from '~/components/ui/getStyles'

defineProps<{
  isLaptop: boolean
}>()

const emit = defineEmits<{
  onOpen: [slide: number]
}>()

const trnFormStore = useTrnFormStore()
const walletsStore = useWalletsStore()
const { t } = useI18n()

const items = ref<
  Record<
    MoneyTypeSlug,
    {
      amountsIdx: 1 | 2
      transferType: TransferType
    }
  >
>({
  expense: {
    amountsIdx: 1,
    transferType: 0,
  },
  income: {
    amountsIdx: 2,
    transferType: 1,
  },
})

const incomeWalletId = computed<WalletId | undefined>(
  () => trnFormStore.values.incomeWalletId ?? walletsStore.sortedIds[0],
)

const expenseWalletId = computed<WalletId | undefined>(
  () => trnFormStore.values.expenseWalletId ?? walletsStore.sortedIds[1],
)

watch(
  () => trnFormStore.values.trnType,
  (trnType) => {
    if (trnType === TrnType.Transfer) {
      incomeWalletId.value && (trnFormStore.values.incomeWalletId = incomeWalletId.value)
      expenseWalletId.value && (trnFormStore.values.expenseWalletId = expenseWalletId.value)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="pb-2">
    <div class="flex flex-col">
      <div
        v-for="(item, slug) in items"
        :key="slug"
        :class="[{
          'border-accent-1': trnFormStore.values.transferType === item.transferType,
        }, getStyles('item', ['rounded'])]"
        class="overflow-hidden border border-transparent"
        @click="trnFormStore.onChangeTransferType(item.transferType)"
      >
        <div class="flex items-center gap-2 whitespace-nowrap">
          <div
            :class="getStyles('item', ['link', 'rounded'])"
            class=" text-1/70 flex min-h-[44px] w-1/2 grow items-center px-3 py-2 text-sm lg:min-h-[42px]"
          >
            {{ t(slug) }}
          </div>

          <TrnFormSelectorWallet
            v-if="slug === 'income' && incomeWalletId"
            :walletId="incomeWalletId"
            :isLaptop
            @onOpen="n => emit('onOpen', n)"
            @onSelected="id => trnFormStore.values.incomeWalletId = id"
          />

          <TrnFormSelectorWallet
            v-if="slug === 'expense' && expenseWalletId"
            :walletId="expenseWalletId"
            :isLaptop
            @onOpen="n => emit('onOpen', n)"
            @onSelected="id => trnFormStore.values.expenseWalletId = id"
          />
        </div>

        <!-- Input -->
        <div class="p-2 pt-1">
          <TrnFormMainInput
            :key="item.amountsIdx"
            :amount="trnFormStore.values.amount[item.amountsIdx]"
            :amountRaw="trnFormStore.values.amountRaw[item.amountsIdx]"
            :highlight="item.transferType === 1 ? 'expense' : 'income'"
            :isShowSum="trnFormStore.getIsShowSum()"
            isTransfer
            @onChange="trnFormStore.onChangeAmount"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<i18n lang="yaml">
en:
  expense: Transfer from
  income: Transfer to
ru:
  expense: Перевод из
  income: Перевод в
</i18n>
