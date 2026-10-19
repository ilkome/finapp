<script setup lang="ts">
import { parseAmountInput } from '~~/utils/money/parseInput'

import type { CurrencyCode, CurrencyError, CurrencyItem } from '~/components/currencies/types'

import { minorDisplays, validateCurrency } from '~/components/currencies/types'

const props = defineProps<{
  /** Built-in name and symbol, shown as placeholders: an empty field keeps them. */
  defaults: { name: string, symbol?: string }
  isBuiltIn: boolean
  isNew: boolean
  /** Currencies a manual rate can be given in, already in picker order. */
  rateCurrencies: { code: CurrencyCode, name: string }[]
  /** Wallets holding this currency: the scale is locked and delete is refused while any exist. */
  usedByWallets: string[]
  value: CurrencyItem
}>()

const emit = defineEmits<{
  delete: []
  reset: []
  save: [item: CurrencyItem]
}>()

const { t } = useI18n()

const form = reactive({
  code: props.value.code,
  isManualRate: props.value.manualRate !== undefined,
  manualRate: props.value.manualRate !== undefined ? String(props.value.manualRate) : '',
  manualRateCurrencyCode: props.value.manualRateCurrencyCode ?? props.rateCurrencies[0]?.code ?? '',
  minorDisplay: props.value.minorDisplay ?? 'auto',
  name: props.value.name ?? '',
  scale: String(props.value.scale ?? 2),
  symbol: props.value.symbol ?? '',
})
const error = ref<CurrencyError | null>(null)

const isScaleLocked = computed(() => props.isBuiltIn || (!props.isNew && props.usedByWallets.length > 0))
const minorDisplayOptions = computed(() => minorDisplays.map(value => ({ label: t(`currencies.form.minorDisplay.${value}`), value })))
const rateOptions = computed(() => props.rateCurrencies
  .filter(c => c.code !== form.code)
  .map(c => ({ label: c.name === c.code ? c.code : `${c.code} - ${c.name}`, value: c.code })))

function toItem(): CurrencyItem {
  const rate = parseAmountInput(form.manualRate) ?? 0
  return {
    code: form.code.trim().toUpperCase(),
    minorDisplay: form.minorDisplay === 'auto' ? undefined : form.minorDisplay,
    name: form.name.trim() || undefined,
    symbol: form.symbol.trim() || undefined,
    ...(props.isBuiltIn ? {} : { scale: Number(form.scale) }),
    ...(form.isManualRate ? { manualRate: rate, manualRateCurrencyCode: form.manualRateCurrencyCode || undefined } : {}),
  }
}

function save() {
  const item = toItem()
  error.value = validateCurrency(item, props.isNew)
  if (!error.value)
    emit('save', item)
}
</script>

<template>
  <div class="grid gap-5 px-3 pb-4 lg:px-4">
    <FormElement v-if="props.isNew">
      <template #label>
        {{ t('currencies.form.code') }}
      </template>
      <FormInput
        v-model="form.code"
        placeholder="PTS"
      />
    </FormElement>

    <FormElement>
      <template #label>
        {{ t('currencies.form.name') }}
      </template>
      <FormInput
        v-model="form.name"
        :placeholder="props.defaults.name"
      />
    </FormElement>

    <FormElement>
      <template #label>
        {{ t('currencies.form.symbol') }}
      </template>
      <FormInput
        v-model="form.symbol"
        :placeholder="props.defaults.symbol ?? props.value.code"
      />
    </FormElement>

    <div>
      <UiTitleSection class="pb-2">
        {{ t('currencies.form.minorDisplay.label') }}
      </UiTitleSection>
      <FormSelect
        :options="minorDisplayOptions"
        :value="form.minorDisplay"
        @change="(value: string) => form.minorDisplay = value as typeof form.minorDisplay"
      />
    </div>

    <FormElement v-if="!props.isBuiltIn">
      <template #label>
        {{ t('currencies.form.scale') }}
      </template>
      <FormInput
        v-model="form.scale"
        inputmode="numeric"
        :disabled="isScaleLocked"
      />
    </FormElement>

    <div class="grid gap-2">
      <UiSwitchItem
        v-if="props.isBuiltIn"
        :checkboxValue="form.isManualRate"
        :title="t('currencies.form.manualRate')"
        @toggle="form.isManualRate = !form.isManualRate"
      />
      <div v-if="form.isManualRate || !props.isBuiltIn" class="grid grid-cols-2 gap-3">
        <FormElement>
          <template #label>
            {{ t('currencies.form.rate', { code: form.code || '?' }) }}
          </template>
          <FormInput
            v-model="form.manualRate"
            inputmode="decimal"
            @update:modelValue="form.isManualRate = true"
          />
        </FormElement>
        <FormElement>
          <template #label>
            {{ t('currencies.form.rateCurrency') }}
          </template>
          <USelectMenu
            v-model="form.manualRateCurrencyCode"
            data-reka-swipe-ignore
            valueKey="value"
            :items="rateOptions"
            @update:modelValue="form.isManualRate = true"
          />
        </FormElement>
      </div>
    </div>

    <div v-if="props.usedByWallets.length && !props.isBuiltIn" class="text-xs text-muted">
      {{ t('currencies.form.usedBy', { wallets: props.usedByWallets.join(', ') }) }}
    </div>

    <div v-if="error" class="text-sm text-error">
      {{ t(`currencies.form.errors.${error}`) }}
    </div>

    <div class="flex items-center justify-center gap-2">
      <UButton
        v-if="props.isBuiltIn && !props.isNew"
        variant="ghost"
        :label="t('currencies.form.reset')"
        @click="emit('reset')"
      />
      <UButton
        v-if="!props.isBuiltIn && !props.isNew"
        color="error"
        variant="ghost"
        :disabled="props.usedByWallets.length > 0"
        :label="t('base.delete')"
        @click="emit('delete')"
      />
      <UiButtonAccent class="sm:max-w-xs" @click="save">
        {{ t('base.save') }}
      </UiButtonAccent>
    </div>
  </div>
</template>
