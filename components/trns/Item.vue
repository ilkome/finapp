<script setup lang="ts">
import type { TrnItemFull } from '~/components/trns/types'

const props = defineProps<{
  alt?: boolean
  date?: string
  trnItem: TrnItemFull
}>()
</script>

<template>
  <UiElement
    v-if="props.trnItem"
    class="group2 py-2"
    isShowLine2
  >
    <template v-if="!alt" #leftIcon>
      <UiIconBase
        :name="props.trnItem.category?.icon"
        :color="props.trnItem.category?.color"
        invert2
      />
    </template>

    <div class="grid gap-1 grow pr-1">
      <div class="flex items-center grow gap-3">
        <template v-if="alt">
          <div
            v-if="date"
            class="truncate text-2xs leading-none"
          >
            {{ date }}
          </div>

          <div
            v-if="trnItem.type === 2"
            class="flex gap-2 items-center"
          >
            <Icon
              :name="props.trnItem.category?.icon?.replace('mdi mdi-', 'mdi:')"
              :color="props.trnItem.category?.color"
              size="16"
            />
            <div
              class="flex items-center gap-2 text-secondary text-xs leading-none"
            >
              {{ trnItem.category.name }}
            </div>
          </div>
        </template>

        <div class="grow grid gap-1">
          <div
            v-if="!alt"
            class="flex gap-2 items-center"
          >
            <!-- Category name -->
            <div class="flex items-center gap-2 text-3 text-sm leading-none">
              {{ trnItem.category?.name }}
            </div>

            <!-- Parent category name -->
            <div
              v-if="trnItem.categoryParent"
              class="text-2xs text-4"
            >
              {{ trnItem.categoryParent.name }}
            </div>
          </div>

          <div
            v-if="trnItem.wallet"
            class="flex gap-2 items-center"
          >
            <!-- <WalletsIcon2
              :color="trnItem.wallet.color"
              :name="trnItem.wallet.name"
              :walletId="trnItem.walletId"
            /> -->

            <div class="text-xs text-4 leading-none">
              {{ trnItem.wallet.name }}
            </div>
          </div>
        </div>

        <Amount
          v-if="trnItem.type !== 2"
          :amount="trnItem.amount"
          :currencyCode="trnItem.wallet.currency"
          :isShowMinus="trnItem.type === 0"
          :isShowPlus="trnItem.type === 1"
          :type="trnItem.type"
          align="right"
          class="grow"
          colorize="income"
        />

        <div
          v-if="trnItem.type === 2"
          class="grid"
          :class="{
            'gap-2': trnItem.incomeAmount !== trnItem.expenseAmount,
          }"
        >
          <div class="flex justify-end gap-3">
            <div class="text-xs">
              {{ $t("trnForm.transfer.from") }} {{ trnItem.expenseWallet.name }}
            </div>

            <Amount
              :amount="trnItem.expenseAmount || trnItem.amount"
              :currencyCode="trnItem.expenseWallet.currency"
              :type="0"
              :colorize="trnItem.incomeAmount === trnItem.expenseAmount ? '' : 'expense'"
            />
          </div>

          <div
            class="flex justify-end gap-3"
          >
            <div class="text-xs">
              {{ $t("trnForm.transfer.to") }} {{ trnItem.incomeWallet.name }}
            </div>

            <Amount
              :amount="trnItem.incomeAmount || trnItem.amount"
              :class="{
                'opacity-0': trnItem.incomeAmount === trnItem.expenseAmount,
              }"
              :currencyCode="trnItem.incomeWallet.currency"
              :type="1"
              colorize="income"
            />
          </div>
        </div>
      </div>

      <div
        v-if="trnItem.desc || trnItem.description"
        class="text-2xs opacity-80"
      >
        {{ trnItem.desc || trnItem.description }}
      </div>
    </div>
  </UiElement>
</template>
