<script setup lang="ts">
import type { TrnItemFull } from '~/components/trns/types'

import { TrnType } from '~/components/trns/types'

const props = defineProps<{
  compact?: boolean
  date?: string
  isActive?: boolean
  trnItem: TrnItemFull
}>()

const emit = defineEmits<{
  click: []
}>()

// One currency and nothing lost on the way: a single amount, on the right like any transaction.
const isSingleAmount = computed(() => props.trnItem.type === TrnType.Transfer
  && props.trnItem.expenseAmount === props.trnItem.incomeAmount
  && props.trnItem.expenseWallet?.currency === props.trnItem.incomeWallet?.currency)
// Only a loan contract is repaid by every transfer in; money moved to a credit card is often just a top-up inside
// its interest-free period, so it stays a plain transfer.
const isLoanPayment = computed(() => props.trnItem.type === TrnType.Transfer && props.trnItem.incomeWallet?.type === 'loan')
</script>

<template>
  <UiElement
    v-if="props.trnItem"
    :isActive="props.isActive"
    :lineWidth="props.compact ? 3 : 0"
    :insideClasses="props.compact ? 'py-2 min-h-8' : 'py-3 min-h-9.5'"
    @click="emit('click')"
  >
    <template v-if="!compact" #leftIcon>
      <UiIconBase
        :name="props.trnItem.category?.icon"
        :color="props.trnItem.category?.color"
        invert
      />
    </template>

    <div class="grid grow gap-1 pr-1">
      <div class="flex grow items-center gap-3">
        <!-- Alt -->
        <template v-if="compact">
          <UiText
            v-if="date"
            class="min-w-10 truncate"
            variant="caption"
          >
            {{ date }}
          </UiText>

          <div
            v-if="trnItem.type === TrnType.Transfer"
            class="flex items-center gap-2 text-muted"
          >
            <Icon
              :name="props.trnItem.category?.icon"
              size="16"
            />
            <UiEntityName variant="compact">
              {{ isLoanPayment ? $t('trns.types.loanPayment') : trnItem.category.name }}
            </UiEntityName>
          </div>
        </template>

        <div
          v-if="trnItem.type !== TrnType.Transfer"
          class="grid grow gap-1"
        >
          <div
            v-if="!compact"
            class="grid grow gap-0.5"
          >
            <CategoriesName
              :category="trnItem.category"
            />
          </div>

          <div
            v-if="trnItem.wallet"
            class="flex items-center gap-2"
          >
            <UiEntityName variant="secondary">
              {{ trnItem.wallet.name }}
            </UiEntityName>
          </div>
        </div>

        <Amount
          v-if="trnItem.type !== TrnType.Transfer"
          :amount="trnItem.amount"
          :currencyCode="trnItem.wallet?.currency"
          :isShowMinus="trnItem.type === TrnType.Expense"
          :isShowPlus="trnItem.type === TrnType.Income"
          :type="trnItem.type"
          align="right"
          class="grow"
          colorize="income"
          variant="row"
        />

        <!-- Transfer -->
        <template v-if="trnItem.type === TrnType.Transfer">
          <div class="grid min-w-0 grow gap-1">
            <div class="flex min-w-0 items-center gap-1">
              <UiEntityName>
                {{ trnItem.expenseWallet.name }}
              </UiEntityName>
              <Icon name="lucide:move-right" size="16" class="shrink-0" />
              <UiEntityName>
                {{ trnItem.incomeWallet.name }}
              </UiEntityName>
            </div>

            <div
              v-if="!isSingleAmount"
              class="flex flex-wrap gap-2"
            >
              <Amount
                :amount="trnItem.expenseAmount"
                :currencyCode="trnItem.expenseWallet.currency"
                :type="TrnType.Expense"
                class="flex! items-center gap-2"
                colorize="expense"
                variant="row"
              />
              <Amount
                :amount="trnItem.incomeAmount"
                :currencyCode="trnItem.incomeWallet.currency"
                :type="TrnType.Income"
                colorize="income"
                class="flex! items-center gap-2"
                variant="row"
              />
            </div>
          </div>

          <Amount
            v-if="isSingleAmount"
            :amount="trnItem.expenseAmount"
            :currencyCode="trnItem.expenseWallet.currency"
            :type="TrnType.Expense"
            align="right"
            class="shrink-0"
            variant="row"
          />
        </template>
      </div>

      <UiText
        v-if="isLoanPayment && !compact"
        class="opacity-80"
        variant="caption"
      >
        {{ $t('trns.types.loanPayment') }}
      </UiText>

      <UiText
        v-if="trnItem.desc"
        class="opacity-80"
        variant="caption"
      >
        {{ trnItem.desc }}
      </UiText>
    </div>
  </UiElement>
</template>
