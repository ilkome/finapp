<script setup lang="ts">
import type { ToastOptions } from 'vue3-toastify'
import { saveData } from '~~/services/firebase/api'
import UiToastContent from '~/components/ui/ToastContent.vue'
import type { WalletForm, WalletId, WalletItem } from '~/components/wallets/types'
import { types } from '~/components/wallets/types'
import { errorEmo, random } from '~/assets/js/emo'
import { generateId } from '~~/utils/generateId'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useUserStore } from '~/components/user/useUserStore'
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
const currenciesStore = useCurrenciesStore()
const userStore = useUserStore()
const walletsStore = useWalletsStore()
const isDemo = useCookie('finapp.isDemo')

const editWalletId = props.walletId ?? generateId()
const walletTypes = types.map(value => ({
  label: t(`money.types.${value}`),
  value,
}))

const activeTab = ref('data')

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
    } as ToastOptions)

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
    } as ToastOptions)

    return false
  }

  // TODO: refactor
  for (const id in walletsStore.items) {
    if (walletsStore.items[id].name === values.name) {
      if (editWalletId) {
        if (editWalletId !== id) {
          $toast(UiToastContent, {
            autoClose: 6000,
            data: {
              description: t('wallets.form.name.exist'),
              title: random(errorEmo),
            },
            type: 'error',
          } as ToastOptions)

          return false
        }
      }
      else {
        $toast(UiToastContent, {
          autoClose: 6000,
          data: {
            description: t('wallets.form.name.exist'),
            title: random(errorEmo),
          },
          type: 'error',
        } as ToastOptions)
        return false
      }
    }
  }

  return true
}

async function onSave() {
  if (!validate(props.walletForm))
    return

  // Prepare data and remove empty values
  const values: WalletItem = Object.fromEntries(Object.entries(normalizeWalletItem(props.walletForm)).filter(([,v]) => v))

  if (isDemo.value) {
    walletsStore.items[generateId()] = values
    emit('afterSave')
    return
  }

  // Set default currency based on first created wallet
  if (!walletsStore.hasItems)
    currenciesStore.updateBase(values.currency)

  await saveData(`users/${userStore.uid}/accounts/${editWalletId}`, values)
  emit('afterSave')
}
</script>

<template>
  <div
    v-if="walletForm"
    class="grid h-full max-w-lg grid-rows-[auto,1fr,auto] overflow-hidden px-2 pt-2 md:px-6"
  >
    <UiTabs>
      <UiTabsItem
        :isActive="activeTab === 'data'"
        @click="activeTab = 'data'"
      >
        {{ t('categories.form.data.label') }}
      </UiTabsItem>
      <UiTabsItem
        :isActive="activeTab === 'currencies'"
        @click="activeTab = 'currencies'"
      >
        {{ t('wallets.form.currencies.label') }}
      </UiTabsItem>
      <UiTabsItem
        :isActive="activeTab === 'colors'"
        @click="activeTab = 'colors'"
      >
        {{ t('wallets.form.colors.label') }}
      </UiTabsItem>
    </UiTabs>

    <!-- Content -->
    <div class="overflow-y-auto py-4">
      <pre>{{ props.walletForm }}</pre>
      <pre>{{ props.walletId }}</pre>

      <!-- Data -->
      <template v-if="activeTab === 'data'">
        <div class="mb-8">
          <div class="text-item-2 pb-2 text-sm leading-none">
            {{ t('wallets.form.name.label') }}
          </div>
          <input
            v-model="props.walletForm.name"
            class="text-item-base bg-item-4 border-item-5 placeholder:text-item-2 focus:text-item-1 focus:bg-item-5 focus:border-accent-4 m-0 w-full rounded-lg border border-solid px-4 py-3 text-base font-normal transition ease-in-out focus:outline-none"
            :placeholder="t('wallets.form.name.placeholder')"
            type="text"
            @input="event => emit('updateValue', 'name', event.target.value)"
          >
        </div>

        <div class="mb-8">
          <div class="text-item-2 pb-2 text-sm leading-none">
            {{ t('wallets.form.description.label') }}
          </div>
          <input
            v-model="props.walletForm.description"
            :placeholder="t('wallets.form.description.placeholder')"
            class="text-item-base bg-item-4 border-item-5 placeholder:text-item-2 focus:text-item-1 focus:bg-item-5 focus:border-accent-4 m-0 w-full rounded-lg border border-solid px-4 py-3 text-base font-normal transition ease-in-out focus:outline-none"
            type="text"
            @input="event => emit('updateValue', 'description', event.target.value)"
          >
        </div>

        <div class="grid gap-6">
          <div>
            <UiTitle class="pb-2">
              {{ t('money.type') }}
            </UiTitle>

            <div>
              <div class="px-1">
                <USelect
                  v-model="walletForm.type"
                  color="blue"
                  :options="walletTypes"
                  optionAttribute="label"
                  variant="outline"
                  size="lg"
                />
              </div>

              <div
                v-if="props.walletForm.type === 'credit'"
              >
                <div class="text-item-2 pt-4 text-sm leading-none">
                  {{ t('wallets.form.credit.limit') }}
                </div>

                <input
                  v-model="props.walletForm.creditLimit"
                  :placeholder="t('wallets.form.credit.limit')"
                  class="text-item-base bg-item-4 border-item-5 placeholder:text-item-2 focus:text-item-1 focus:bg-item-5 focus:border-accent-4 m-0 mb-4 mt-2 w-full rounded-lg border border-solid px-4 py-3 text-base font-normal transition ease-in-out focus:outline-none"
                  type="number"
                  @input="event => emit('updateValue', 'creditLimit', event.target.value)"
                >
              </div>
            </div>
          </div>

          <div>
            <UiTitle class="pb-2">
              {{ t('settings.options') }}
            </UiTitle>

            <UiCheckbox
              :checkboxValue="props.walletForm.isWithdrawal"
              :title="t('money.options.withdrawal')"
              @onClick="emit('updateValue', 'isWithdrawal', !props.walletForm.isWithdrawal)"
            />
            <UiCheckbox
              :checkboxValue="props.walletForm.isExcludeInTotal"
              :title="t('money.options.isExcludeInTotal')"
              @onClick="emit('updateValue', 'isExcludeInTotal', !props.walletForm.isExcludeInTotal)"
            />
            <UiCheckbox
              :checkboxValue="props.walletForm.isArchived"
              :title="t('money.totals.archived')"
              @onClick="emit('updateValue', 'isArchived', !props.walletForm.isArchived)"
            />
          </div>
        </div>
      </template>

      <!-- Currencies -->
      <CurrenciesList
        v-if="activeTab === 'currencies'"
        :active="props.walletForm.currency"
        class="max-h-screen max-w-full"
        @onSelect="value => emit('updateValue', 'currency', value)"
      />

      <!-- Colors -->
      <div
        v-if="activeTab === 'colors'"
        class="h-full overflow-hidden overflow-y-auto"
      >
        <div class="pb-4">
          <ColorPalette
            :activeColor="props.walletForm.color"
            @click="color => emit('updateValue', 'color', color)"
          />
        </div>

        <div class="text-item-2 pb-2 text-sm">
          {{ t('wallets.form.colors.custom') }}
        </div>
        <input v-model="props.walletForm.color" type="color" class="h-12 w-full cursor-pointer border-0 p-0">
      </div>
    </div>

    <div class="flex-center">
      <UiButtonBlue @click="onSave">
        {{ t('base.save') }}
      </UiButtonBlue>
    </div>
  </div>
</template>

<i18n lang="yaml">
en:
  isCredit: Credit account

ru:
  isCredit: Кредитный счёт
</i18n>
