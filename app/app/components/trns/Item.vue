<script setup lang="ts">
import type { TrnItemFull } from '~/components/trns/types'

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
const isSingleAmount = computed(() => props.trnItem.type === 'transfer'
  && (!props.trnItem.fromWallet || !props.trnItem.toWallet
    || (props.trnItem.fromAmount === props.trnItem.toAmount
      && props.trnItem.fromWallet.currencyCode === props.trnItem.toWallet.currencyCode)))
// Only a loan contract is repaid by every transfer in; money moved to a credit card is often just a top-up inside
// its interest-free period, so it stays a plain transfer.
const isLoanPayment = computed(() => props.trnItem.type === 'transfer' && props.trnItem.toWallet?.type === 'loan')
const wallet = computed(() => props.trnItem.fromWallet ?? props.trnItem.toWallet)
const amount = computed(() => props.trnItem.fromAmount ?? props.trnItem.toAmount ?? 0)
const isOutflow = computed(() => !!props.trnItem.fromWallet)
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
        :name="props.trnItem.category?.icon ?? ''"
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
            v-if="trnItem.type === 'transfer'"
            class="flex items-center gap-2 text-muted"
          >
            <Icon
              :name="props.trnItem.category?.icon ?? ''"
              size="16"
            />
            <UiEntityName variant="compact">
              {{ isLoanPayment ? $t('trns.types.loanPayment') : trnItem.category?.name }}
            </UiEntityName>
          </div>
        </template>

        <div
          v-if="trnItem.type !== 'transfer'"
          class="grid grow gap-1"
        >
          <div
            v-if="!compact"
            class="grid grow gap-0.5"
          >
            <CategoriesName
              v-if="trnItem.category"
              :category="trnItem.category"
            />
          </div>

          <div
            v-if="wallet"
            class="flex items-center gap-2"
          >
            <UiEntityName variant="secondary">
              {{ wallet.name }}
            </UiEntityName>
          </div>
        </div>

        <Amount
          v-if="trnItem.type !== 'transfer'"
          :amount
          :currencyCode="wallet?.currencyCode ?? ''"
          :isShowMinus="isOutflow"
          :isShowPlus="!isOutflow"
          :type="trnItem.type"
          align="right"
          class="grow"
          colorize="income"
          variant="row"
        />

        <!-- Transfer -->
        <template v-if="trnItem.type === 'transfer'">
          <div class="grid min-w-0 grow gap-1">
            <div class="flex min-w-0 items-center gap-1">
              <UiEntityName>
                {{ trnItem.fromWallet?.name ?? $t('trnForm.transfer.outside') }}
              </UiEntityName>
              <Icon name="lucide:move-right" size="16" class="shrink-0" />
              <UiEntityName>
                {{ trnItem.toWallet?.name ?? $t('trnForm.transfer.outside') }}
              </UiEntityName>
            </div>

            <div
              v-if="!isSingleAmount"
              class="flex flex-wrap gap-2"
            >
              <Amount
                :amount="trnItem.fromAmount ?? 0"
                :currencyCode="trnItem.fromWallet?.currencyCode ?? ''"
                type="expense"
                class="flex! items-center gap-2"
                colorize="expense"
                variant="row"
              />
              <Amount
                :amount="trnItem.toAmount ?? 0"
                :currencyCode="trnItem.toWallet?.currencyCode ?? ''"
                type="income"
                colorize="income"
                class="flex! items-center gap-2"
                variant="row"
              />
            </div>
          </div>

          <Amount
            v-if="isSingleAmount"
            :amount
            :currencyCode="wallet?.currencyCode ?? ''"
            type="transfer"
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
        v-if="trnItem.description"
        class="opacity-80"
        variant="caption"
      >
        {{ trnItem.description }}
      </UiText>
    </div>
  </UiElement>
</template>
