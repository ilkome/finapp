<script setup lang="ts">
import type { TrnConversion, TrnTransferRate } from '~/components/trns/preview'
import type { TrnItemFull } from '~/components/trns/types'

export type TrnPreviewLoan = {
  kind: 'credit' | 'fine' | 'interest' | 'payment'
  name: string
  walletId: string
}

const props = defineProps<{
  canFilterCategory: boolean
  canFilterWallet: boolean
  conversions: TrnConversion[]
  createdAtLabel?: string
  dateLabel: string
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

const isTransfer = computed(() => props.trnItem.type === 'transfer')
const ownWallet = computed(() => props.trnItem.fromWallet ?? props.trnItem.toWallet)
const amount = computed(() => props.trnItem.fromAmount ?? props.trnItem.toAmount ?? 0)
const isOutflow = computed(() => !!props.trnItem.fromWallet)
const wallets = computed(() => [
  props.trnItem.fromWalletId && props.trnItem.fromWallet ? { id: props.trnItem.fromWalletId, name: props.trnItem.fromWallet.name } : undefined,
  props.trnItem.toWalletId && props.trnItem.toWallet ? { id: props.trnItem.toWalletId, name: props.trnItem.toWallet.name } : undefined,
].filter(item => !!item))
const typeLabel = computed(() => `trns.types.${props.trnItem.type}`)
// A rate is a ratio, not money: a plain number with the precision a rate needs.
const rateFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 })
function formatRate(rate: number) {
  return `${rateFormat.format(rate)} ${props.transferRate?.to ?? ''}`
}
</script>

<template>
  <div class="grid gap-5">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <UiIconBase
        :name="props.trnItem.category?.icon ?? ''"
        :color="props.trnItem.category?.color"
        invert
      />
      <div class="grid grow gap-0.5">
        <CategoriesName v-if="props.trnItem.category" :category="props.trnItem.category" />
        <UiText variant="caption" class="opacity-70">
          {{ $t(typeLabel) }} · {{ props.dateLabel }}
        </UiText>
      </div>
    </div>

    <!-- Amount -->
    <div v-if="!isTransfer" data-preview-amount>
      <Amount
        :amount
        :currencyCode="ownWallet?.currencyCode ?? ''"
        :isShowMinus="isOutflow"
        :isShowPlus="!isOutflow"
        :type="props.trnItem.type"
        colorize="income"
        variant="display"
      />
    </div>
    <div v-else-if="props.trnItem.type === 'transfer'" class="grid gap-1" data-preview-amount>
      <div class="flex items-center gap-2">
        <Amount v-if="props.trnItem.fromWallet" :amount="props.trnItem.fromAmount ?? 0" :currencyCode="props.trnItem.fromWallet.currencyCode" type="expense" colorize="expense" variant="display" />
        <template v-if="props.trnItem.toWallet && (props.transferRate || !props.trnItem.fromWallet)">
          <Icon v-if="props.trnItem.fromWallet" name="lucide:move-right" size="20" />
          <Amount :amount="props.trnItem.toAmount ?? 0" :currencyCode="props.trnItem.toWallet.currencyCode" type="income" colorize="income" variant="display" />
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

      <template v-if="props.trnItem.description">
        <dt class="opacity-60">
          {{ $t('trns.fields.description') }}
        </dt>
        <dd data-preview-desc>
          {{ props.trnItem.description }}
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

      <template v-if="props.createdAtLabel">
        <dt class="opacity-60">
          {{ $t('trns.preview.enteredAt') }}
        </dt>
        <dd>{{ props.createdAtLabel }}</dd>
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
        <span class="text-right" data-rate>{{ formatRate(props.transferRate.transfer) }}</span>
        <template v-if="props.transferRate.onDate !== undefined">
          <span class="opacity-60">{{ $t('trns.preview.onDate') }}</span>
          <span class="text-right" data-rate>{{ formatRate(props.transferRate.onDate) }}</span>
        </template>
        <template v-if="props.transferRate.now !== undefined">
          <span class="opacity-60">{{ $t('trns.preview.now') }}</span>
          <span class="text-right" data-rate>{{ formatRate(props.transferRate.now) }}</span>
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
