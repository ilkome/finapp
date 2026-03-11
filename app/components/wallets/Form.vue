<script setup lang="ts">
import { generateId } from '~~/utils/generateId'

import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletId, WalletItem, WalletType } from '~/components/wallets/types'

import { walletItemSchema, walletTypes } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { showErrorToast } from '~/composables/useStoreSync'

const props = defineProps<{
  walletForm: WalletItem
  walletId?: WalletId
}>()

const emit = defineEmits<{
  afterSave: []
  update: [key: keyof WalletItem, value: WalletItem[keyof WalletItem]]
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()

const editWalletId = props.walletId ?? generateId()
const walletType = walletTypes.map(value => ({
  label: t(`money.types.${value}`),
  value,
}))

const modals = ref({
  colors: false,
  currencies: false,
})

const walletPlaceholder = computed(() => ({
  ...props.walletForm,
  amount: 0,
  name: props.walletForm.name ? props.walletForm.name : t('wallets.form.name.label'),
}))

async function onSave() {
  const values = walletItemSchema.safeParse(props.walletForm)

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
      <UiButtonWithRight @click="modals.currencies = true">
        <template #label>
          {{ t('wallets.form.currencies.label') }}
        </template>

        <template #value>
          {{ props.walletForm.currency }}
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
          :modelValue="props.walletForm.desc ?? ''"
          @update:modelValue="(value: string) => emit('update', 'desc', value)"
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
      <FormElement v-if="props.walletForm.type === 'credit'">
        <template #label>
          {{ t('wallets.form.credit.limit') }}
        </template>
        <FormInput
          :placeholder="t('wallets.form.credit.limit')"
          :modelValue="props.walletForm.creditLimit ?? ''"
          @update:modelValue="(value: string) => emit('update', 'creditLimit' as keyof WalletItem, +value)"
        />
      </FormElement>

      <!-- Options -->
      <div class="grid gap-1">
        <div>
          <UiSwitchItem
            :checkboxValue="props.walletForm.isWithdrawal ?? false"
            :title="t('money.options.withdrawal')"
            @click="emit('update', 'isWithdrawal', !props.walletForm.isWithdrawal)"
          />
          <UiSwitchItem
            :checkboxValue="props.walletForm.isExcludeInTotal ?? false"
            :title="t('money.options.isExcludeInTotal')"
            @click="emit('update', 'isExcludeInTotal', !props.walletForm.isExcludeInTotal)"
          />
          <UiSwitchItem
            :checkboxValue="props.walletForm.isArchived ?? false"
            :title="t('money.totals.archived')"
            @click="emit('update', 'isArchived', !props.walletForm.isArchived)"
          />
        </div>
      </div>
    </div>

    <div class="flex-center">
      <UiButtonAccent
        class="sm:max-w-xs"
        rounded
        @click="onSave"
      >
        {{ t('base.save') }}
      </UiButtonAccent>
    </div>
  </div>

  <CurrenciesModal
    v-if="modals.currencies"
    :activeCode="props.walletForm.currency"
    @select="(c: CurrencyCode) => emit('update', 'currency', c)"
    @close="modals.currencies = false"
  />

  <!-- Colors  -->
  <BottomSheetModal
    v-if="modals.colors"
    @closed="modals.colors = false"
  >
    <template #default="{ close }">
      <div>
        <UiTitleModal>{{ t('color.label') }}</UiTitleModal>
        <WalletsItem
          :walletId="props.walletId ?? editWalletId"
          :wallet="walletPlaceholder"
          isShowIcon
        />
      </div>

      <div class="scrollerBlock bottomSheetContentInside">
        <ColorPalette
          :activeColor="props.walletForm.color"
          isWallet
          @click="(color: string) => emit('update', 'color', color)"
        />
      </div>

      <div class="flex-center py-2">
        <UiButtonAccent
          rounded
          @click="close"
        >
          {{ t('base.apply') }}
        </UiButtonAccent>
      </div>
    </template>
  </BottomSheetModal>
</template>
