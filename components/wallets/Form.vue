<script setup lang="ts">
import type { ToastOptions } from 'vue3-toastify'
import type { WalletForm, WalletId } from '~/components/wallets/types'
import { generateId } from '~/utils/generateId'
import { getPreparedFormData } from '~/components/wallets/getForm'
import { saveData } from '~/services/firebase/api'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useUserStore } from '~/components/user/useUser'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { allColors } from '~/assets/js/colors'
import UiToastContent from '~/components/ui/ToastContent.vue'
import { errorEmo, random, successEmo } from '~/assets/js/emo'

const props = defineProps<{
  walletForm: WalletForm
  walletId?: WalletId
}>()

const emit = defineEmits(['updateValue', 'afterSave'])

const { $toast } = useNuxtApp()
const { t } = useI18n()
const currenciesStore = useCurrenciesStore()
const userStore = useUserStore()
const walletsStore = useWalletsStore()

const { walletForm, walletId } = toRefs(props)
const editWalletId = walletId.value ?? generateId()

const activeTab = ref('data')

/**
 * Validate
 */
function validate(values, wallets) {
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
  for (const id in wallets) {
    if (wallets[id].name === values.name) {
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

async function saveWalletData(id, values) {
  const uid = userStore.uid

  // Set default currency based on first created wallet
  if (!walletsStore.hasItems)
    currenciesStore.updateBase(values.currency)

  await saveData(`users/${uid}/accounts/${id}`, values)
}

async function onSave() {
  if (!validate(walletForm.value, walletsStore.items))
    return

  await saveWalletData(editWalletId, getPreparedFormData(walletForm.value))
  emit('afterSave')
}
</script>

<template>
  <div
    v-if="walletForm"
    class="overflow-hidden h-full grid gap-3 grid-rows-[auto,1fr,auto] px-3"
  >
    <UiTabs>
      <UiTabsItem
        :isActive="activeTab === 'data'"
        @click="activeTab = 'data'"
      >
        {{ $t('categories.form.data.label') }}
      </UiTabsItem>
      <UiTabsItem
        :isActive="activeTab === 'currencies'"
        @click="activeTab = 'currencies'"
      >
        {{ $t('wallets.form.currencies.label') }}
      </UiTabsItem>
      <UiTabsItem
        :isActive="activeTab === 'colors'"
        @click="activeTab = 'colors'"
      >
        {{ $t('wallets.form.colors.label') }}
      </UiTabsItem>
    </UiTabs>

    <!-- Content -->
    <div class="overflow-hidden max-w-md">
      <!-- Data -->
      <template v-if="activeTab === 'data'">
        <div class="mb-8">
          <div class="pb-2 text-item-2 text-sm leading-none">
            {{ $t('wallets.form.name.label') }}
          </div>
          <input
            v-model="walletForm.name"
            class="w-full m-0 py-3 px-4 rounded-lg text-base font-normal text-item-base bg-item-4 border border-solid border-item-5 placeholder_text-item-2 transition ease-in-out focus_text-item-1 focus_bg-item-5 focus_border-accent-4 focus_outline-none"
            :placeholder="$t('wallets.form.name.placeholder')"
            type="text"
            @input="event => emit('updateValue', 'name', event.target.value)"
          >
        </div>

        <div class="mb-6">
          <div class="pb-2 text-item-2 text-sm leading-none">
            {{ $t('wallets.form.description.label') }}
          </div>
          <input
            v-model="walletForm.description"
            :placeholder="$t('wallets.form.description.placeholder')"
            class="w-full m-0 py-3 px-4 rounded-lg text-base font-normal text-item-base bg-item-4 border border-solid border-item-5 placeholder_text-item-2 transition ease-in-out focus_text-item-1 focus_bg-item-5 focus_border-accent-4 focus_outline-none"
            type="text"
            @input="event => emit('updateValue', 'description', event.target.value)"
          >
        </div>

        <UiCheckbox
          :checkboxValue="walletForm.countTotal"
          :title="$t('countTotal')"
          @onClick="walletForm.countTotal = !walletForm.countTotal"
        />

        <UiCheckbox
          :checkboxValue="walletForm.isCredit"
          :title="$t('isCredit')"
          @onClick="walletForm.isCredit = !walletForm.isCredit"
        />
        <UiCheckbox
          :checkboxValue="walletForm.withdrawal"
          :title="$t('withdrawal')"
          @onClick="walletForm.withdrawal = !walletForm.withdrawal"
        />
        <UiCheckbox
          :checkboxValue="walletForm.isDeposit"
          :title="$t('isDeposit')"
          @onClick="walletForm.isDeposit = !walletForm.isDeposit"
        />
        <UiCheckbox
          :checkboxValue="walletForm.isCash"
          :title="$t('isCash')"
          @onClick="walletForm.isCash = !walletForm.isCash"
        />
        <UiCheckbox
          :checkboxValue="walletForm.isCashless"
          :title="$t('isCashless')"
          @onClick="walletForm.isCashless = !walletForm.isCashless"
        />

        <div class="pt-4">
          <input
            v-if="walletForm.isCredit"
            v-model="walletForm.creditLimit"
            :placeholder="$t('wallets.form.credit.limit')"
            class="w-full m-0 py-3 px-4 rounded-lg text-base font-normal text-item-base bg-item-4 border border-solid border-item-5 placeholder_text-item-2 transition ease-in-out focus_text-item-1 focus_bg-item-5 focus_border-accent-4 focus_outline-none"
            type="text"
            @input="event => emit('updateValue', 'creditLimit', event.target.value)"
          >
        </div>
      </template>

      <!-- Currencies -->
      <CurrenciesList
        v-if="activeTab === 'currencies'"
        :active="walletForm.currency"
        @onSelect="value => emit('updateValue', 'currency', value)"
      />

      <!-- Colors -->
      <div
        v-if="activeTab === 'colors'"
        class="h-full overflow-hidden overflow-y-auto"
      >
        <div class="pb-4">
          <div v-for="(colorsGroup, groupIdx) in allColors" :key="groupIdx" class="pb-1">
            <div class="colors">
              <div
                v-for="(color, idx) in colorsGroup"
                :key="idx"
                :class="{ '_active': color === walletForm.color, 'pointer-events-none': !color }"
                :style="{ background: color === walletForm.color ? color : 'transparent' }"
                class="iconItem"
                @click="emit('updateValue', 'color', color)"
              >
                <div :style="{ background: color }" class="colorPreview" />
              </div>
            </div>
          </div>
        </div>
        <div class="pb-2 text-sm text-item-2">
          {{ $t('wallets.form.colors.custom') }}
        </div>
        <input v-model="walletForm.color" type="color" class="cursor-pointer w-full h-12 p-0 border-0">
      </div>
    </div>

    <div class="flex-center">
      <UiButtonBlue maxWidth @click="onSave">
        {{ $t('base.save') }}
      </UiButtonBlue>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
@import "../assets/stylus/variables"

.colorPreview
  display flex
  align-items center
  justify-content center
  width 90%
  height 90%
  border-radius 50%

.colors
  display grid
  grid-template-columns repeat(8, minmax(auto, 1fr))
  padding-bottom 20px
  &:last-child
    padding-bottom 0

.iconItem
  display flex
  align-items center
  justify-content center
  width 40px
  height 40px
  max-width 40px
  max-height 40px
  padding 4px
  font-size 24px
  border-radius 50%

  +media-hover()
    &:not(._empty)
      cursor pointer
      background var(--accent-4)

  &._active
    padding 0
    background var(--accent-4)
</style>

<i18n lang="yaml">
en:
  isCredit: Credit account

ru:
  isCredit: Кредитный счёт
</i18n>
