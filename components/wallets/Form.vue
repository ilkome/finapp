<script setup lang="ts">
import { generateId } from '~/utils/generateId'
import type { WalletForm, WalletId } from '~/components/wallets/types'
import { getPreparedFormData } from '~/components/wallets/getForm'
import { saveData } from '~/services/firebase/api'

const props = defineProps<{
  walletId?: WalletId
  walletForm: WalletForm
}>()

const emit = defineEmits(['updateValue', 'afterSave'])

const { walletId, walletForm } = toRefs(props)
const { $store, $notify, nuxt2Context: { i18n } } = useNuxtApp()
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
      text: i18n.t('wallets.form.name.error'),
    })
    return false
  }

  // currency
  if (!values.currency) {
    $notify({
      title: '😮',
      text: i18n.t('wallets.form.currency.error'),
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
            text: i18n.t('wallets.form.name.exist'),
          })
          return false
        }
      }
      else {
        $notify({
          title: '😮',
          text: i18n.t('wallets.form.name.exist'),
        })
        return false
      }
    }
  }

  return true
}

async function saveWalletData(id, values) {
  const uid = $store.state.user.user.uid

  // Set default currency based on first created wallet
  if (!$store.getters['wallets/hasWallets'])
    $store.dispatch('currencies/setBaseCurrency', values.currency)

  await saveData(`users/${uid}/accounts/${id}`, values)
}

async function onSave() {
  if (!validate(walletForm.value, $store.state.wallets.items))
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
        .pb-2.text-skin-item-base-down.text-sm.leading-none {{ $t('wallets.form.name.label') }}
        input.w-full.m-0.py-3.px-4.rounded-lg.text-base.font-normal.text-skin-item-base.bg-skin-item-main-bg.border.border-solid.border-skin-item-main-hover.placeholder_text-skin-item-base-down.transition.ease-in-out.focus_text-skin-item-base-up.focus_bg-skin-item-main-hover.focus_border-blue3.focus_outline-none(
          :placeholder="$t('wallets.form.name.placeholder')"
          :value="walletForm.name"
          type="text"
          @input="event => emit('updateValue', 'name', event.target.value)"
        )

      .mb-6
        .pb-2.text-skin-item-base-down.text-sm.leading-none {{ $t('wallets.form.description.label') }}
        input.w-full.m-0.py-3.px-4.rounded-lg.text-base.font-normal.text-skin-item-base.bg-skin-item-main-bg.border.border-solid.border-skin-item-main-hover.placeholder_text-skin-item-base-down.transition.ease-in-out.focus_text-skin-item-base-up.focus_bg-skin-item-main-hover.focus_border-blue3.focus_outline-none(
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
        :title="$t('isCredit')"
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

      .pb-2.text-sm.text-skin-item-base-down {{ $t('wallets.form.colors.custom') }}
      input.cursor-pointer.w-full.h-12.p-0.border-0(v-model="walletForm.color" type="color")

    .pt-4.pb-6
      SharedButton(
        :class="['_text-center _blue2 _ml-big', { _inline: $store.state.ui.pc }]"
        :title="$t('wallets.form.save')"
        @onClick="onSave"
      )
</template>

<style lang="stylus" scoped>
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
  padding-bottom $m8
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
      background var(--c-item-bd-hover)

  &._active
    padding 0
    background var(--c-item-bd-hover)
</style>

<i18n lang="yaml">
en:
  isCredit: Credit account

ru:
  isCredit: Кредитный счёт
</i18n>
