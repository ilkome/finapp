<script setup lang="ts">
import { generateId } from '~~/utils/generateId'

import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletFormKey, WalletId, WalletItem, WalletType } from '~/components/wallets/types'

import { amountToMinor, minorToAmount } from '~/components/amount/utils'
import { useBankReportsStore } from '~/components/bankReports/useBankReportsStore'
import { useLoansStore } from '~/components/loans/useLoansStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { isWalletInForecast, walletItemSchema, walletTypes } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useFeature } from '~/composables/useFeatures'
import { showErrorToast } from '~/composables/useStoreSync'

const props = defineProps<{
  walletForm: WalletItem
  walletId?: WalletId
}>()

const emit = defineEmits<{
  afterSave: []
  update: [key: WalletFormKey, value: unknown]
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()
const bankReportsStore = useBankReportsStore()
const loansStore = useLoansStore()
const trnsStore = useTrnsStore()

const editWalletId = props.walletId ?? generateId()
const isLoans = useFeature('loans')
// A wallet that already is a loan keeps its type in the list with the feature off.
const walletType = computed(() => walletTypes
  .filter(value => value !== 'loan' || isLoans.value || props.walletForm.type === 'loan')
  .map(value => ({
    label: t(`money.types.${value}`),
    value,
  })))

const modals = ref({
  colors: false,
  currencies: false,
})

const walletPlaceholder = computed(() => ({
  ...props.walletForm,
  amount: 0,
  name: props.walletForm.name ? props.walletForm.name : t('wallets.form.name.label'),
}))

// Amounts in a wallet's currency would mean something else after a switch.
const isCurrencyLocked = computed(() => {
  const id = props.walletId
  if (!id)
    return false
  if (loansStore.items[id] || bankReportsStore.items[id])
    return true
  return Object.values(trnsStore.items ?? {}).some(trn => trn.fromWalletId === id || trn.toWalletId === id)
})

function onOpenCurrencies() {
  if (isCurrencyLocked.value)
    showErrorToast('wallets.form.currencies.locked')
  else
    modals.value.currencies = true
}

const creditLimitInput = computed(() => props.walletForm.creditLimit === undefined
  ? ''
  : String(minorToAmount(props.walletForm.creditLimit, props.walletForm.currencyCode)))

function onChangeCreditLimit(value: string) {
  const amount = Number.parseFloat(String(value).replace(',', '.'))
  emit('update', 'creditLimit', Number.isFinite(amount) && amount > 0 ? amountToMinor(amount, props.walletForm.currencyCode) : undefined)
}

async function onSave() {
  const form = props.walletForm.type === 'credit_card' ? props.walletForm : { ...props.walletForm, creditLimit: undefined }
  const values = walletItemSchema.safeParse({ ...form, updatedAt: Date.now() })

  if (!values.success) {
    showErrorToast('wallets.form.name.error')
    return
  }

  await walletsStore.saveWallet({
    id: editWalletId,
    values: values.data,
  })
  emit('afterSave')
}
</script>

<template>
  <div
    v-if="props.walletForm"
    class="grid h-full max-w-lg grid-rows-[1fr_auto] overflow-hidden px-3 md:h-auto lg:px-4"
  >
    <div class="grid content-start gap-6 overflow-y-auto py-4">
      <!-- Name -->
      <FormElement>
        <template #label>
          {{ t('wallets.form.name.label') }}
        </template>

        <FormInput
          :placeholder="t('wallets.form.name.placeholder')"
          :modelValue="props.walletForm.name ?? ''"
          @update:modelValue="(value: string) => emit('update', 'name', value)"
        />
      </FormElement>

      <!-- Currencies -->
      <UiButtonWithRight :class="{ 'opacity-60': isCurrencyLocked }" @click="onOpenCurrencies">
        <template #label>
          {{ t('wallets.form.currencies.label') }}
        </template>

        <template #value>
          {{ props.walletForm.currencyCode }}
        </template>
      </UiButtonWithRight>

      <!-- Color -->
      <UiButtonWithRight @click="modals.colors = true">
        <template #label>
          {{ t('color.label') }}
        </template>

        <template #value>
          <WalletsIcon
            :color="props.walletForm.color"
            :name="props.walletForm.name"
          />
        </template>
      </UiButtonWithRight>

      <!-- Description -->
      <FormElement>
        <template #label>
          {{ t('wallets.form.description.label') }}
        </template>
        <FormTextarea
          :placeholder="t('wallets.form.description.placeholder')"
          :modelValue="props.walletForm.description ?? ''"
          @update:modelValue="(value: string) => emit('update', 'description', value)"
        />
      </FormElement>

      <!-- Type -->
      <div>
        <UiTitleSection class="pb-2">
          {{ t('money.type') }}
        </UiTitleSection>

        <FormSelect
          :options="walletType"
          :value="props.walletForm.type ?? 'cash'"
          @change="(value: string) => emit('update', 'type', value as WalletType)"
        />
      </div>

      <!-- Credit Limit -->
      <FormElement v-if="props.walletForm.type === 'credit_card'">
        <template #label>
          {{ t('wallets.form.credit.limit') }}
        </template>
        <FormInput
          :placeholder="t('wallets.form.credit.limit')"
          :modelValue="creditLimitInput"
          @update:modelValue="onChangeCreditLimit"
        />
      </FormElement>

      <!-- Options -->
      <div class="grid gap-1">
        <div>
          <UiSwitchItem
            :checkboxValue="props.walletForm.isWithdrawable ?? false"
            :title="t('money.options.withdrawal')"
            @toggle="emit('update', 'isWithdrawable', !props.walletForm.isWithdrawable)"
          />
          <UiSwitchItem
            :checkboxValue="isWalletInForecast(props.walletForm)"
            :title="t('money.options.isInForecast')"
            @toggle="emit('update', 'isInForecast', !isWalletInForecast(props.walletForm))"
          />
          <UiSwitchItem
            :checkboxValue="props.walletForm.isExcludedFromTotal ?? false"
            :title="t('money.options.isExcludedFromTotal')"
            @toggle="emit('update', 'isExcludedFromTotal', !props.walletForm.isExcludedFromTotal)"
          />
          <UiSwitchItem
            :checkboxValue="props.walletForm.isArchived ?? false"
            :title="t('money.totals.archived')"
            @toggle="emit('update', 'isArchived', !props.walletForm.isArchived)"
          />
        </div>
      </div>
    </div>

    <div class="flex items-center justify-center">
      <UiButtonAccent
        class="sm:max-w-xs"
        @click="onSave"
      >
        {{ t('base.save') }}
      </UiButtonAccent>
    </div>
  </div>

  <CurrenciesModal
    v-if="modals.currencies"
    :activeCode="props.walletForm.currencyCode"
    @select="(c: CurrencyCode) => emit('update', 'currencyCode', c)"
    @close="modals.currencies = false"
  />

  <!-- Colors  -->
  <Drawer
    v-if="modals.colors"
    :title="t('color.label')"
    contentClass="min-h-[50dvh]"
    @closed="modals.colors = false"
  >
    <template #header>
      <WalletsItem
        :walletId="props.walletId ?? editWalletId"
        :wallet="walletPlaceholder"
        isShowIcon
      />
    </template>

    <template #default="{ close }">
      <div class="drawer-body">
        <ColorPalette
          :activeColor="props.walletForm.color"
          isWallet
          @click="(color: string) => emit('update', 'color', color)"
        />
      </div>

      <div class="flex items-center justify-center py-2">
        <UiButtonAccent
          @click="close"
        >
          {{ t('base.apply') }}
        </UiButtonAccent>
      </div>
    </template>
  </Drawer>
</template>
