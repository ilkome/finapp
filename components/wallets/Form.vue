<script setup lang="ts">
import type { WalletForm, WalletId } from '~/components/wallets/types'
import { generateId } from '~/utils/generateId'
import { getPreparedFormData } from '~/components/wallets/getForm'
import { saveData } from '~/services/firebase/api'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useUserStore } from '~/components/user/useUser'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { allColors } from '~/assets/js/colors'

const props = defineProps<{
  walletId?: WalletId
  walletForm: WalletForm
}>()

const emit = defineEmits(['updateValue', 'afterSave'])

const { $notify, $i18n } = useNuxtApp()
const { t } = useI18n()
const currenciesStore = useCurrenciesStore()
const userStore = useUserStore()
const walletsStore = useWalletsStore()

const { walletId, walletForm } = toRefs(props)
const editWalletId = walletId.value ?? generateId()

const activeTab = ref('data')

/**
 * Validate
 */
function validate(values, wallets) {
  // name
  if (!values.name) {
    $notify({
      title: '😮',
      text: $i18n.t('wallets.form.name.error'),
    })
    return false
  }

  // currency
  if (!values.currency) {
    $notify({
      title: '😮',
      text: $i18n.t('wallets.form.currency.error'),
    })
    return false
  }

  // TODO: refactor
  for (const id in wallets) {
    if (wallets[id].name === values.name) {
      if (editWalletId) {
        if (editWalletId !== id) {
          $notify({
            title: '😮',
            text: $i18n.t('wallets.form.name.exist'),
          })
          return false
        }
      }
      else {
        $notify({
          title: '😮',
          text: $i18n.t('wallets.form.name.exist'),
        })
        return false
      }
    }
  }

  return true
}

async function saveWalletData(id, values) {
  const uid = userStore.uid

  // Set default currency based on first created wallet
  if (!walletsStore.hasWallets)
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

<template lang="pug">
div(v-if="walletForm")
  .pb-8.px-2
    UiTabs
      UiTabsItem(
        :isActive="activeTab === 'data'"
        @click="activeTab = 'data'"
      ) {{ $t('categories.form.data.label') }}

      UiTabsItem(
        :isActive="activeTab === 'currencies'"
        @click="activeTab = 'currencies'"
      ) {{ $t('wallets.form.currencies.label') }}

      UiTabsItem(
        :isActive="activeTab === 'colors'"
        @click="activeTab = 'colors'"
      ) {{ $t('wallets.form.colors.label') }}

  //- Content
  //-----------------------------------
  .px-2.max-w-md
    //- Data
    //-----------------------------------
    template(v-if="activeTab === 'data'")
      .mb-8
        .pb-2.text-item-2.text-sm.leading-none {{ $t('wallets.form.name.label') }}
        input.w-full.m-0.py-3.px-4.rounded-lg.text-base.font-normal.text-item-base.bg-item-4.border.border-solid.border-item-5.placeholder_text-item-2.transition.ease-in-out.focus_text-item-1.focus_bg-item-5.focus_border-accent-4.focus_outline-none(
          :placeholder="$t('wallets.form.name.placeholder')"
          :value="walletForm.name"
          type="text"
          @input="event => emit('updateValue', 'name', event.target.value)"
        )

      .mb-6
        .pb-2.text-item-2.text-sm.leading-none {{ $t('wallets.form.description.label') }}
        input.w-full.m-0.py-3.px-4.rounded-lg.text-base.font-normal.text-item-base.bg-item-4.border.border-solid.border-item-5.placeholder_text-item-2.transition.ease-in-out.focus_text-item-1.focus_bg-item-5.focus_border-accent-4.focus_outline-none(
          :placeholder="$t('wallets.form.description.placeholder')"
          :value="walletForm.description"
          type="text"
          @input="event => emit('updateValue', 'description', event.target.value)"
        )

      SharedContextMenuItem(
        :checkboxValue="walletForm.countTotal"
        :title="$t('wallets.form.total.placeholder')"
        showCheckbox
        @onClick="walletForm.countTotal = !walletForm.countTotal"
      )

      SharedContextMenuItem(
        :checkboxValue="walletForm.isCredit"
        :title="t('isCredit')"
        showCheckbox
        @onClick="walletForm.isCredit = !walletForm.isCredit"
      )

    //- Currencies
    //-----------------------------------
    CurrenciesList.-mt-3(
      v-if="activeTab === 'currencies'"
      :active="walletForm.currency"
      @onSelect="value => emit('updateValue', 'currency', value)"
    )

    //- Colors
    //---------------------------------
    template(v-if="activeTab === 'colors'")
      .pb-4
        .pb-1(
          v-for="(colorsGroup, groupIdx) in allColors"
          :key="groupIdx"
        )
          .colors
            .iconItem(
              v-for="(color, idx) in colorsGroup"
              :key="idx"
              :class="{ _active: color === walletForm.color, 'pointer-events-none': !color }"
              :style="{ background: color === walletForm.color ? color : 'transparent' }"
              @click="emit('updateValue', 'color', color)"
            )
              .colorPreview(:style="{ background: color }")

      .pb-2.text-sm.text-item-2 {{ $t('wallets.form.colors.custom') }}
      input.cursor-pointer.w-full.h-12.p-0.border-0(v-model="walletForm.color" type="color")

    .pt-4.pb-6.flex-center
      UiButtonBlue(
        maxWidth
        @click="onSave"
      ) {{ $t('base.save') }}
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
