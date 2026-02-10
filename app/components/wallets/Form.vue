<script setup lang="ts">
import { generateId } from '~~/utils/generateId'

import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletId, WalletItem, WalletType } from '~/components/wallets/types'

import { errorEmo, random } from '~/assets/js/emo'
import { types, walletItemSchema } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  walletForm: WalletItem
  walletId?: WalletId
}>()

const emit = defineEmits<{
  afterSave: []
  updateValue: [key: keyof WalletItem, value: WalletItem[keyof WalletItem]]
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()
const toast = useToast()

const editWalletId = props.walletId ?? generateId()
const walletType = types.map(value => ({
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

/**
 * Validate
 */
// function validate(values: WalletItem) {
//   // name
//   if (!values.name) {
//     toast.add({
//       color: 'error',
//       description: t('wallets.form.name.error'),
//       title: random(errorEmo),
//     })

//     return false
//   }

//   // currency
//   if (!values.currency) {
//     toast.add({
//       color: 'error',
//       description: t('wallets.form.currency.error'),
//       title: random(errorEmo),
//     })

//     return false
//   }

//   // Check for duplicate wallet names
//   const existingWallet = Object.entries(walletsStore.items ?? {})
//     .find(([id, wallet]) => wallet.name === values.name && id !== editWalletId)

//   if (existingWallet) {
//     toast.add({
//       color: 'error',
//       description: t('wallets.form.name.exist'),
//       title: random(errorEmo),
//     })
//     return false
//   }

//   return true
// }

async function onSave() {
  const values = walletItemSchema.safeParse(props.walletForm)

  if (!values.success) {
    toast.add({
      color: 'error',
      description: t('categories.form.name.error'),
      title: random(errorEmo),
    })
    return
  }

  await walletsStore.createOrUpdateWallet({
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
          :value="props.walletForm.name ?? ''"
          @updateValue="(value: string) => emit('updateValue', 'name', value)"
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
          :value="props.walletForm.desc ?? ''"
          @updateValue="(value: string) => emit('updateValue', 'desc', value)"
        />
      </FormElement>

      <!-- Type -->
      <div>
        <UiTitle3 class="pb-2">
          {{ t('money.type') }}
        </UiTitle3>

        <FormSelect
          :options="walletType"
          :value="props.walletForm.type ?? 'cash'"
          @change="(value: WalletType) => emit('updateValue', 'type', value)"
        />
      </div>

      <!-- Credit Limit -->
      <FormElement v-if="props.walletForm.type === 'credit'">
        <template #label>
          {{ t('wallets.form.credit.limit') }}
        </template>
        <FormInput
          :placeholder="t('wallets.form.credit.limit')"
          :value="props.walletForm.creditLimit ?? ''"
          @updateValue="(value: string) => emit('updateValue', 'creditLimit', +value)"
        />
      </FormElement>

      <!-- Options -->
      <div class="grid gap-1">
        <div>
          <UiCheckbox
            :checkboxValue="props.walletForm.isWithdrawal ?? false"
            :title="t('money.options.withdrawal')"
            @click="emit('updateValue', 'isWithdrawal', !props.walletForm.isWithdrawal)"
          />
          <UiCheckbox
            :checkboxValue="props.walletForm.isExcludeInTotal ?? false"
            :title="t('money.options.isExcludeInTotal')"
            @click="emit('updateValue', 'isExcludeInTotal', !props.walletForm.isExcludeInTotal)"
          />
          <UiCheckbox
            :checkboxValue="props.walletForm.isArchived ?? false"
            :title="t('money.totals.archived')"
            @click="emit('updateValue', 'isArchived', !props.walletForm.isArchived)"
          />
        </div>
      </div>
    </div>

    <div class="flex-center">
      <UiButtonAccent
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
    @onSelect="(c: CurrencyCode) => emit('updateValue', 'currency', c)"
    @onClose="modals.currencies = false"
  />

  <Teleport to="#teleports">
    <!-- Colors  -->
    <BottomSheet
      v-if="modals.colors"
      isShow
      drugClassesCustom="bottomSheetDrugClassesCustom"
      @closed="modals.colors = false"
    >
      <template #handler="{ close }">
        <BottomSheetHandler />
        <BottomSheetClose @onClick="close" />
      </template>

      <template #default="{ close }">
        <div class="bottomSheetContent">
          <div>
            <UiTitleModal>{{ t('color.label') }}</UiTitleModal>
            <WalletsItem
              :walletId="props.walletId ?? 'editWalletId'"
              :wallet="walletPlaceholder"
              isShowIcon
            />
          </div>

          <div class="scrollerBlock bottomSheetContentInside">
            <ColorPalette
              :activeColor="props.walletForm.color"
              isWallet
              @click="(color: string) => emit('updateValue', 'color', color)"
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
        </div>
      </template>
    </BottomSheet>
  </Teleport>
</template>
