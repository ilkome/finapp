<script setup lang="ts">
import UiToastContent from '~/components/ui/ToastContent.vue'
import type { WalletForm, WalletId, WalletItem, WalletType } from '~/components/wallets/types'
import { icons, types } from '~/components/wallets/types'
import { errorEmo, random } from '~/assets/js/emo'
import { generateId } from '~~/utils/generateId'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { normalizeWalletItem } from '~/components/wallets/utils'

const props = defineProps<{
  walletForm: WalletForm
  walletId?: WalletId
}>()

const emit = defineEmits<{
  afterSave: []
  updateValue: [key: keyof WalletItem, value: string | number | boolean]
}>()

const { $toast } = useNuxtApp()
const { t } = useI18n()
const walletsStore = useWalletsStore()

const editWalletId = props.walletId ?? generateId()
const walletType = types.map(value => ({
  label: t(`money.types.${value}`),
  value,
}))

const modals = ref({
  colors: false,
  currencies: false,
})

/**
 * Validate
 */
function validate(values: WalletForm) {
  // name
  if (!values.name) {
    $toast(UiToastContent, {
      autoClose: 6000,
      data: {
        description: t('wallets.form.name.error'),
        title: random(errorEmo),
      },
      type: 'error',
    })

    return false
  }

  // currency
  if (!values.currency) {
    $toast(UiToastContent, {
      autoClose: 6000,
      data: {
        description: t('wallets.form.currency.error'),
        title: random(errorEmo),
      },
      type: 'error',
    })

    return false
  }

  // Check for duplicate wallet names
  const existingWallet = Object.entries(walletsStore.items ?? {})
    .find(([id, wallet]) => wallet.name === values.name && id !== editWalletId)

  if (existingWallet) {
    $toast(UiToastContent, {
      autoClose: 6000,
      data: {
        description: t('wallets.form.name.exist'),
        title: random(errorEmo),
      },
      type: 'error',
    })
    return false
  }

  return true
}

async function onSave() {
  if (!validate(props.walletForm))
    return

  const values: WalletItem = normalizeWalletItem(props.walletForm)
  await walletsStore.addWallet({ id: editWalletId, values })
  emit('afterSave')
}
</script>

<template>
  <div
    v-if="props.walletForm"
    class="grid h-full max-w-lg grid-rows-[1fr,auto] overflow-hidden px-2 pt-2 md:h-auto md:px-6"
  >
    <div class="grid content-start gap-6 overflow-y-auto py-4">
      <!-- Name -->
      <UiFormElement>
        <template #label>
          {{ t('wallets.form.name.label') }}
        </template>

        <UiFormInput
          :placeholder="t('wallets.form.name.placeholder')"
          :value="props.walletForm.name ?? ''"
          @updateValue="(value: string) => emit('updateValue', 'name', value)"
        />
      </UiFormElement>

      <!-- Currencies -->
      <UiItem2 @click="modals.currencies = true">
        <template #label>
          {{ t('wallets.form.currencies.label') }}
        </template>

        <template #value>
          {{ props.walletForm.currency }}
        </template>
      </UiItem2>

      <!-- Color -->
      <UiItem2 @click="modals.colors = true">
        <template #label>
          {{ t('color.label') }}
        </template>

        <template #value>
          <Icon
            :name="icons[props.walletForm.type ?? 'cash']"
            :style="{ color: props.walletForm.color }"
            class="size-6"
          />
        </template>
      </UiItem2>

      <!-- Description -->
      <UiFormElement>
        <template #label>
          {{ t('wallets.form.description.label') }}
        </template>
        <UiFormInput
          :placeholder="t('wallets.form.description.placeholder')"
          :value="props.walletForm.description ?? ''"
          @updateValue="(value: string) => emit('updateValue', 'description', value)"
        />
      </UiFormElement>

      <!-- Type -->
      <div>
        <UiTitle class="pb-2">
          {{ t('money.type') }}
        </UiTitle>

        <div class="px-1">
          <USelect
            :options="walletType"
            :value="props.walletForm.type"
            color="blue"
            optionAttribute="label"
            size="lg"
            variant="outline"
            @change="(value: WalletType) => emit('updateValue', 'type', value)"
          />
        </div>
      </div>

      <!-- Credit Limit -->
      <UiFormElement v-if="props.walletForm.type === 'credit'">
        <template #label>
          {{ t('wallets.form.credit.limit') }}
        </template>
        <UiFormInput
          :placeholder="t('wallets.form.credit.limit')"
          :value="props.walletForm.creditLimit ?? 0"
          @updateValue="(value: string) => emit('updateValue', 'creditLimit', value)"
        />
      </UiFormElement>

      <!-- Options -->
      <div>
        <UiTitle class="pb-2">
          {{ t('settings.options') }}
        </UiTitle>

        <UiCheckbox
          :checkboxValue="props.walletForm.isWithdrawal ?? false"
          :title="t('money.options.withdrawal')"
          @onClick="emit('updateValue', 'isWithdrawal', !props.walletForm.isWithdrawal)"
        />
        <UiCheckbox
          :checkboxValue="props.walletForm.isExcludeInTotal ?? false"
          :title="t('money.options.isExcludeInTotal')"
          @onClick="emit('updateValue', 'isExcludeInTotal', !props.walletForm.isExcludeInTotal)"
        />
        <UiCheckbox
          :checkboxValue="props.walletForm.isArchived ?? false"
          :title="t('money.totals.archived')"
          @onClick="emit('updateValue', 'isArchived', !props.walletForm.isArchived)"
        />
      </div>
    </div>

    <div class="flex-center">
      <UiButtonBlue @click="onSave">
        {{ t('base.save') }}
      </UiButtonBlue>
    </div>
  </div>

  <CurrenciesModal
    v-if="modals.currencies"
    :activeCode="props.walletForm.currency"
    @onSelect="c => emit('updateValue', 'currency', c)"
    @onClose="modals.currencies = false"
  />

  <Teleport to="#teleports">
    <!-- Colors  -->
    <BaseBottomSheet2
      v-if="modals.colors"
      isShow
      drugClassesCustom="max-w-md bg-foreground-1 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 rounded-xl"
      @closed="modals.colors = false"
    >
      <template #handler="{ close }">
        <BaseBottomSheetHandler />
        <BaseBottomSheetClose @onClick="close" />
      </template>

      <template #default="{ close }">
        <div class="bg-foreground-1 grid h-full max-h-[90vh] grid-rows-[auto,1fr,auto] overflow-hidden px-3">
          <div class="grid gap-3 py-4">
            <UiTitle>{{ t("color.label") }}</UiTitle>
            <WalletsItem
              :walletId="props.walletId"
              :wallet="props.walletForm"
              isShowIcon
            />
          </div>

          <div class="scrollerBlock h-full overflow-hidden overflow-y-auto">
            <div class="grid gap-6">
              <ColorPalette
                :activeColor="props.walletForm.color"
                @click="color => emit('updateValue', 'color', color)"
              />

              <UiFormElement>
                <template #label>
                  {{ t('color.custom') }}
                </template>
                <input
                  :placeholder="t('wallets.form.credit.limit')"
                  :value="props.walletForm.color"
                  class="text-item-base bg-item-4 border-item-5 placeholder:text-item-2 focus:text-item-1 focus:bg-item-5 focus:border-accent-4 w-full rounded-lg border border-solid px-4 py-3 text-base font-normal transition ease-in-out focus:outline-none"
                  type="color"
                  @input="(event: HTMLInputEvent) => emit('updateValue', 'color', event.target.value)"
                >
              </UiFormElement>
            </div>
          </div>

          <div class="flex-center py-2">
            <UiButtonBlue
              maxWidth
              @click="close"
            >
              {{ t("base.save") }}
            </UiButtonBlue>
          </div>
        </div>
      </template>
    </BaseBottomSheet2>
  </Teleport>
</template>
