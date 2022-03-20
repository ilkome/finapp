<script setup lang="ts">
import { allColors, popularColors } from '~/assets/js/colorsPopular'

const props = defineProps<{
  walletForm: {
    name: string
    color: string
    currency: string
  }
}>()
const { walletForm } = toRefs(props)
const emit = defineEmits(['updateValue', 'onSave'])

const { $store } = useNuxtApp()
const activeTab = ref('data')

// function findWalletWithThisColor(color) {
//   const walletsItems = $store.state.wallets.items
//   if (!walletsItems)
//     return false

//   const walletIdWithThisColor = Object.keys(walletsItems)?.find(id => walletsItems[id]?.color === color)
//   if (!walletIdWithThisColor)
//     return false

//   return true
// }
</script>

<template lang="pug">
div
  //- Menu
  //-----------------------------------
  .px-3
    .overflow-hidden.mb-8.rounded-md.scrollbar.bg-skin-item-main-bg.dark_shadow
      .overflow-hidden.overflow-x-auto.flex.items-center.text-sm.text-center.max-w-md
        .cursor-pointer.px-6.py-3.grow.hocus_bg-skin-item-main-hover(
          :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-300 dark_bg-232323': activeTab === 'data' }"
          @click="activeTab = 'data'"
        ) {{ $t('categories.form.data.label') }}

        .cursor-pointer.px-6.py-3.grow.hocus_bg-skin-item-main-hover(
          :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-300 dark_bg-232323': activeTab === 'currencies' }"
          @click="activeTab = 'currencies'"
        ) {{ $t('wallets.form.currencies.label') }}

        .cursor-pointer.px-6.py-3.grow.hocus_bg-skin-item-main-hover(
          :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-300 dark_bg-232323': activeTab === 'colors' }"
          @click="activeTab = 'colors'"
        ) {{ $t('categories.form.colors.label') }}

  //- Content
  //-----------------------------------
  .px-3.max-w-md
    //- Data
    //-----------------------------------
    template(v-if="activeTab === 'data'")
      .mb-4
        .pb-2.text-skin-item-base-down.text-sm.leading-none {{ $t('wallets.form.name.label') }}
        input.w-full.m-0.py-3.px-4.rounded-lg.text-base.font-normal.text-skin-item-base.bg-skin-item-main-bg.border.border-solid.border-skin-item-main-hover.placeholder_text-skin-item-base-down.transition.ease-in-out.focus_text-skin-item-base-up.focus_bg-skin-item-main-hover.focus_border-blue3.focus_outline-none(
          :placeholder="$t('wallets.form.name.placeholder')"
          :value="walletForm.name"
          type="text"
          @input="event => emit('updateValue', 'name', event.target.value)"
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
      .pb-2.text-sm.text-skin-item-base-down {{ $t('popularColors') }}
      .colors
        .iconItem(
          v-for="(color, idx) in popularColors"
          :key="idx"
          :class="{ _active: color === walletForm.color }"
          :style="{ background: color === walletForm.color ? color : 'transparent' }"
          @click="emit('updateValue', 'color', color)"
        )
          template(v-if="color")
            .colorPreview(:style="{ background: color }")

      .pb-2.text-sm.text-skin-item-base-down {{ $t('palette') }}
      .colors
        .iconItem(
          v-for="(color, idx) in allColors"
          :key="idx"
          :class="{ _active: color === walletForm.color, '_empty pointer-events-none': !color }"
          :style="{ background: color === walletForm.color ? color : 'transparent' }"
          @click="emit('updateValue', 'color', color)"
        )

          template(v-if="color")
            .colorPreview(:style="{ background: color }")

      .pb-2.text-sm.text-skin-item-base-down {{ $t('categories.form.colors.custom') }}
      input.cursor-pointer.w-full.h-12.p-0.border-0(v-model="walletForm.color" type="color")

    .pt-4.pb-6
      SharedButton(
        :class="['_text-center _blue2 _ml-big', { _inline: $store.state.ui.pc }]"
        :title="$t('wallets.form.save')"
        @onClick="emit('onSave')"
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

<i18n lang="json5">
{
  "en": {
    "isCredit": "Credit account"
  },
  "ru": {
    "isCredit": "Кредитный счёт"
  }
}
</i18n>
