<script setup lang="ts">
import type { TrnConversion, TrnTransferRate } from '~/components/trns/preview'
import type { TrnItemFull } from '~/components/trns/types'

import { TrnType } from '~/components/trns/types'

export type TrnPreviewLoan = {
  kind: 'credit' | 'fine' | 'interest' | 'payment'
  name: string
  walletId: string
}

const props = defineProps<{
  canFilterCategory: boolean
  canFilterWallet: boolean
  conversions: TrnConversion[]
  dateLabel: string
  enteredAtLabel?: string
  /** False when the synced rate history starts after the transaction's day. */
  hasRatesOnDate: boolean
  loan?: TrnPreviewLoan
  transferRate?: TrnTransferRate | null
  trnItem: TrnItemFull
  updatedAtLabel: string
}>()

const emit = defineEmits<{
  delete: []
  duplicate: []
  edit: []
  filterCategory: []
  filterDate: []
  filterWallet: [walletId: string]
  openWallet: [walletId: string]
}>()

const isTransfer = computed(() => props.trnItem.type === TrnType.Transfer)
const amount = computed(() => props.trnItem.type === TrnType.Transfer ? props.trnItem.expenseAmount : props.trnItem.amount)
const currency = computed(() => props.trnItem.type === TrnType.Transfer ? props.trnItem.expenseWallet.currency : props.trnItem.wallet.currency)
const wallets = computed(() => props.trnItem.type === TrnType.Transfer
  ? [{ id: props.trnItem.expenseWalletId, name: props.trnItem.expenseWallet.name }, { id: props.trnItem.incomeWalletId, name: props.trnItem.incomeWallet.name }]
  : [{ id: props.trnItem.walletId, name: props.trnItem.wallet.name }])
const typeLabel = computed(() => ({
  [TrnType.Expense]: 'trns.types.expense',
  [TrnType.Income]: 'trns.types.income',
  [TrnType.Transfer]: 'trns.types.transfer',
})[props.trnItem.type])
</script>

<template>
  <div class="grid gap-5">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <UiIconBase
        :name="props.trnItem.category?.icon"
        :color="props.trnItem.category?.color"
        invert
      />
      <div class="grid grow gap-0.5">
        <CategoriesName :category="props.trnItem.category" />
        <UiText variant="caption" class="opacity-70">
          {{ $t(typeLabel) }} · {{ props.dateLabel }}
        </UiText>
      </div>
    </div>

    <!-- Amount -->
    <div v-if="!isTransfer" data-preview-amount>
      <Amount
        :amount
        :currencyCode="currency"
        :isShowMinus="props.trnItem.type === TrnType.Expense"
        :isShowPlus="props.trnItem.type === TrnType.Income"
        :type="props.trnItem.type"
        colorize="income"
        variant="display"
      />
    </div>
    <div v-else-if="props.trnItem.type === TrnType.Transfer" class="grid gap-1" data-preview-amount>
      <div class="flex items-center gap-2">
        <Amount :amount="props.trnItem.expenseAmount" :currencyCode="props.trnItem.expenseWallet.currency" :type="TrnType.Expense" colorize="expense" variant="display" />
        <template v-if="props.transferRate">
          <Icon name="lucide:move-right" size="20" />
          <Amount :amount="props.trnItem.incomeAmount" :currencyCode="props.trnItem.incomeWallet.currency" :type="TrnType.Income" colorize="income" variant="display" />
        </template>
      </div>
    </div>

    <!-- Details -->
    <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
      <dt class="opacity-60">
        {{ $t('trns.fields.wallet') }}
      </dt>
      <dd class="flex flex-wrap items-center gap-1">
        <template v-for="(wallet, index) in wallets" :key="wallet.id">
          <Icon v-if="index > 0" name="lucide:move-right" size="14" />
          <span>{{ wallet.name }}</span>
        </template>
      </dd>

      <template v-if="props.trnItem.desc">
        <dt class="opacity-60">
          {{ $t('trns.fields.description') }}
        </dt>
        <dd data-preview-desc>
          {{ props.trnItem.desc }}
        </dd>
      </template>

      <template v-if="props.loan">
        <dt class="opacity-60">
          {{ $t('trns.preview.loan') }}
        </dt>
        <dd>
          <UButton
            :label="`${$t(`trns.preview.loanKinds.${props.loan.kind}`)} · ${props.loan.name}`"
            class="-mx-2 -my-1"
            color="neutral"
            size="sm"
            trailingIcon="lucide:chevron-right"
            variant="ghost"
            data-preview-loan
            @click="emit('openWallet', props.loan.walletId)"
          />
        </dd>
      </template>

      <template v-if="props.enteredAtLabel">
        <dt class="opacity-60">
          {{ $t('trns.preview.enteredAt') }}
        </dt>
        <dd>{{ props.enteredAtLabel }}</dd>
      </template>

      <dt class="opacity-60">
        {{ $t('trns.preview.updatedAt') }}
      </dt>
      <dd>{{ props.updatedAtLabel }}</dd>
    </dl>

    <!-- Transfer rate -->
    <div v-if="props.transferRate" class="grid gap-2" data-preview-rate>
      <UiText variant="section">
        {{ $t('trns.preview.rate', { from: props.transferRate.from, to: props.transferRate.to }) }}
      </UiText>
      <div class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
        <span class="opacity-60">{{ $t('trns.preview.inTransfer') }}</span>
        <Amount :amount="props.transferRate.transfer" :currencyCode="props.transferRate.to" :precision="4" align="right" variant="row" />
        <template v-if="props.transferRate.onDate !== undefined">
          <span class="opacity-60">{{ $t('trns.preview.onDate') }}</span>
          <Amount :amount="props.transferRate.onDate" :currencyCode="props.transferRate.to" :precision="4" align="right" variant="row" />
        </template>
        <template v-if="props.transferRate.now !== undefined">
          <span class="opacity-60">{{ $t('trns.preview.now') }}</span>
          <Amount :amount="props.transferRate.now" :currencyCode="props.transferRate.to" :precision="4" align="right" variant="row" />
        </template>
      </div>
    </div>

    <!-- Conversions -->
    <div v-if="props.conversions.length" class="grid gap-2" data-preview-conversions>
      <UiText variant="section">
        {{ $t('trns.preview.conversions') }}
      </UiText>
      <div class="grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-1 text-sm">
        <span />
        <span v-if="props.hasRatesOnDate" class="text-right opacity-60">{{ $t('trns.preview.onDate') }}</span>
        <span v-else />
        <span class="text-right opacity-60">{{ $t('trns.preview.now') }}</span>

        <template v-for="row in props.conversions" :key="row.currency">
          <span class="opacity-60">{{ row.currency }}</span>
          <Amount v-if="row.onDate !== undefined" :amount="row.onDate" :currencyCode="row.currency" align="right" variant="row" />
          <span v-else />
          <Amount v-if="row.now !== undefined" :amount="row.now" :currencyCode="row.currency" align="right" variant="row" />
          <span v-else />
        </template>
      </div>
      <UiText v-if="!props.hasRatesOnDate" variant="caption" class="opacity-60">
        {{ $t('trns.preview.noRatesOnDate') }}
      </UiText>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-2">
      <UButton
        v-if="props.canFilterCategory"
        :label="$t('trns.filter.byCategory')"
        color="neutral"
        icon="hugeicons:folder-library"
        variant="soft"
        @click="emit('filterCategory')"
      />
      <template v-if="props.canFilterWallet">
        <UButton
          v-for="wallet in wallets"
          :key="wallet.id"
          :label="wallets.length > 1 ? wallet.name : $t('trns.filter.byWallet')"
          color="neutral"
          icon="hugeicons:wallet-01"
          variant="soft"
          @click="emit('filterWallet', wallet.id)"
        />
      </template>
      <UButton
        :label="$t('trns.filter.byDate')"
        color="neutral"
        icon="lucide:calendar-days"
        variant="soft"
        @click="emit('filterDate')"
      />
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <UButton
        :label="$t('base.edit')"
        block
        icon="lucide:pencil"
        data-preview-edit
        @click="emit('edit')"
      />
      <UButton
        :label="$t('base.duplicate')"
        color="neutral"
        icon="lucide:copy"
        variant="soft"
        @click="emit('duplicate')"
      />
      <UButton
        :aria-label="$t('base.delete')"
        color="error"
        icon="lucide:trash-2"
        variant="soft"
        data-preview-delete
        @click="emit('delete')"
      />
    </div>
  </div>
</template>
