<script setup lang="ts">
export type LoansRecommendationPick = {
  interestSaved: number
  name: string
  /** Preformatted civil day the loan would end on, null when it closes right away. */
  newEndDate: string | null
  walletId: string
}

const props = defineProps<{
  avalanche: LoansRecommendationPick | null
  baseCurrencyCode: string
  /** Extra payment in the base currency. */
  extra: number
  /** Sum of the picked wallets, in the base currency. */
  freeMoney: number
  snowball: LoansRecommendationPick | null
  wallets: { amount: number, currencyCode: string, isSelected: boolean, name: string, walletId: string }[]
}>()

const emit = defineEmits<{
  'toggleWallet': [walletId: string]
  'update:extra': [value: number]
}>()

const { t } = useI18n()

const picks = computed(() => [
  { key: 'avalanche', pick: props.avalanche },
  { key: 'snowball', pick: props.snowball },
].filter((item): item is { key: string, pick: LoansRecommendationPick } => item.pick !== null))
</script>

<template>
  <div class="grid gap-2">
    <UiText variant="section">
      {{ t('loans.recommendation.title') }}
    </UiText>

    <div class="flex items-baseline justify-between gap-2">
      <UiText variant="caption">
        {{ t('loans.recommendation.freeMoney') }}
      </UiText>
      <Amount
        :amount="props.freeMoney"
        :currencyCode="props.baseCurrencyCode"
        :isShowBaseRate="false"
        align="left"
        variant="secondary"
      />
    </div>

    <div class="grid">
      <div
        v-for="wallet in props.wallets"
        :key="wallet.walletId"
        class="flex items-center gap-2"
        :data-loan-free-wallet="wallet.walletId"
      >
        <UiSwitchItem
          class="grow"
          :checkboxValue="wallet.isSelected"
          :title="wallet.name"
          trailing
          @click="emit('toggleWallet', wallet.walletId)"
        />
        <Amount
          :amount="wallet.amount"
          :currencyCode="wallet.currencyCode"
          :isShowBaseRate="false"
          variant="secondary"
        />
      </div>
    </div>

    <FormInput
      type="number"
      :modelValue="String(props.extra)"
      :placeholder="t('loans.extraAmount')"
      @update:modelValue="(value: string) => emit('update:extra', Number(value) || 0)"
    />

    <UiText v-if="picks.length === 0" variant="meta">
      {{ t('loans.recommendation.empty') }}
    </UiText>

    <div
      v-for="item in picks"
      :key="item.key"
      class="grid gap-1 rounded-sm bg-elevated/30 px-3 py-2"
      :data-loan-pick="item.key"
    >
      <UiText variant="caption">
        {{ t(`loans.recommendation.${item.key}`) }}
      </UiText>

      <div class="flex flex-wrap items-baseline gap-2">
        <UiText variant="navigation">
          {{ item.pick.name }}
        </UiText>
        <Amount
          :amount="item.pick.interestSaved"
          :currencyCode="props.baseCurrencyCode"
          :isShowBaseRate="false"
          class="ml-auto"
          align="left"
          variant="secondary"
        />
        <UiText v-if="item.pick.newEndDate" variant="meta">
          → {{ item.pick.newEndDate }}
        </UiText>
      </div>

      <UiText variant="meta">
        {{ t(`loans.recommendation.${item.key}Hint`) }}
      </UiText>
    </div>
  </div>
</template>
