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

const isShowWallets = ref(false)
const selectedCount = computed(() => props.wallets.filter(wallet => wallet.isSelected).length)

const picks = computed(() => [
  { key: 'avalanche', pick: props.avalanche },
  { key: 'snowball', pick: props.snowball },
].filter((item): item is { key: string, pick: LoansRecommendationPick } => item.pick !== null))
</script>

<template>
  <div class="grid gap-2">
    <UiTitleSection>
      {{ t('loans.recommendation.title') }}
    </UiTitleSection>

    <button
      type="button"
      class="-mx-2 flex min-h-10.5 items-center gap-2 rounded-md interactive px-2 text-left"
      :aria-expanded="isShowWallets"
      data-loan-free-wallets-toggle
      @click="isShowWallets = !isShowWallets"
    >
      <div class="grid">
        <UiText variant="caption">
          {{ t('loans.recommendation.freeMoney') }}
        </UiText>
        <UiText variant="meta">
          {{ t('loans.recommendation.fromWallets', { n: selectedCount, total: props.wallets.length }) }}
        </UiText>
      </div>
      <Amount
        :amount="props.freeMoney"
        :currencyCode="props.baseCurrencyCode"
        :isShowBaseRate="false"
        class="ml-auto"
        variant="secondary"
      />
      <Icon
        :name="isShowWallets ? 'lucide:chevron-up' : 'lucide:chevron-down'"
        class="shrink-0 text-muted"
        size="18"
      />
    </button>

    <div v-if="isShowWallets" class="grid">
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

    <div class="grid gap-1">
      <UiText variant="caption">
        {{ t('loans.extraAmount') }}, {{ props.baseCurrencyCode }}
      </UiText>
      <div class="flex items-center gap-2">
        <FormInput
          type="number"
          inputmode="decimal"
          :modelValue="String(props.extra)"
          @update:modelValue="(value: string) => emit('update:extra', Number(value) || 0)"
        />
        <UButton
          color="neutral"
          size="sm"
          variant="soft"
          class="shrink-0"
          data-loan-extra-all
          @click="emit('update:extra', Math.round(props.freeMoney))"
        >
          {{ t('loans.recommendation.allFree') }}
        </UButton>
      </div>
    </div>

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

      <UiText variant="navigation">
        {{ item.pick.name }}
      </UiText>

      <div class="flex flex-wrap items-baseline gap-x-1.5">
        <UiText variant="meta">
          {{ t('loans.interestSaved') }}
        </UiText>
        <Amount
          :amount="item.pick.interestSaved"
          :currencyCode="props.baseCurrencyCode"
          :isShowBaseRate="false"
          align="left"
          variant="secondary"
        />
      </div>

      <UiText variant="meta">
        {{ item.pick.newEndDate ? t('loans.recommendation.closesOn', { date: item.pick.newEndDate }) : t('loans.recommendation.closesNow') }}
      </UiText>

      <UiText variant="meta">
        {{ t(`loans.recommendation.${item.key}Hint`) }}
      </UiText>
    </div>
  </div>
</template>
