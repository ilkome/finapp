<script setup lang="ts">
import { allColors, popularColors } from '~/assets/js/colorsPopular'
import { currencies } from '~/components/currencies/currencies'
import { getTrnsIds } from '~/components/trns/functions/getTrns'
import { random, successEmo } from '~/assets/js/emo'
import { removeData } from '~/services/firebase/api'

const { $store, $notify, nuxt2Context: { i18n } } = useNuxtApp()

const route = useRoute()
const router = useRouter()

const activeTab = ref('data')

const walletId = computed(() => route.params.id)
const wallet = computed(() => $store.state.wallets.items[walletId.value])

const walletForm = ref({
  color: wallet.value?.color || random(popularColors),
  countTotal: wallet.value?.countTotal || true,
  currency: wallet.value?.currency || 'RUB',
  isCredit: wallet.value?.isCredit || false,
  name: wallet.value?.name || null,
  order: wallet.value?.order || 1,
})

function findWalletWithThisColor(color) {
  const walletsItems = $store.state.wallets.items
  if (!walletsItems) return false
  const walletIdWithThisColor = Object.keys(walletsItems)?.find(id => walletsItems[id]?.color === color)
  if (!walletIdWithThisColor) return false

  return true
}

function onSelectColor(color) {
  walletForm.value.color = color
}

function onCurrencySelect(currency) {
  walletForm.value.currency = currency
}

const trnsItems = computed(() => $store.state.trns.items)
const trnsIds = computed(() =>
  getTrnsIds({
    walletsIds: [walletId.value],
    trnsItems: trnsItems.value,
  }))

const isShowDeleteConfirm = ref(false)

// TODO: translate
const deleteDescText = computed(() => {
  if (trnsIds.value.length > 0)
    return `It's also will delete ${trnsIds.value.length} trns in this wallet`
  return null
})

// TODO: translate
async function onDeleteConfirm() {
  // Disable reactive to have data when user have already redirected to wallets page
  const uid = JSON.parse(JSON.stringify($store.state.user.user.uid))
  const trnsIdsS = JSON.parse(JSON.stringify(trnsIds.value))
  const walletIdS = JSON.parse(JSON.stringify(walletId.value))

  router.push('/wallets')

  // Give some time to complete redirect
  setTimeout(async() => {
    await this.$store.dispatch('trns/deleteTrnsByIds', trnsIdsS)
    removeData(`users/${uid}/accounts/${walletIdS}`)
      .then(() => {
        $notify({
          type: 'success',
          text: trnsIdsS?.length > 0 ? `Success delete wallet with ${trnsIdsS.length} transactions!` : 'Success delete wallet!',
          title: random(successEmo),
        })
      })
  }, 100)
}

function onSave() {
  const wallets = $store.state.wallets.items

  // name
  if (!walletForm.value.name) {
    $notify({
      title: '😮',
      text: i18n.t('wallets.form.name.error'),
    })
    return false
  }

  // currency
  if (!walletForm.value.currency) {
    $notify({
      title: '😮',
      text: i18n.t('wallets.form.currency.error'),
    })
    return false
  }

  for (const id in wallets) {
    if (wallets[id].name === walletForm.value.name) {
      if (walletId.value) {
        if (walletId.value !== id) {
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

  const id = walletId.value

  const walletsValues = {
    color: walletForm.value.color,
    countTotal: walletForm.value.countTotal,
    currency: walletForm.value.currency,
    isCredit: walletForm.value.isCredit,
    name: walletForm.value.name,
    order: walletForm.value.order,
  }

  $store.dispatch('wallets/addWallet', { id, values: walletsValues })
  router.push(`/wallets/${walletId.value}`)
}
</script>

<script lang="ts">
export default defineComponent({
  head() {
    return {
      title: `${this.$t('base.edit')}: ${this.wallet?.name}`,
    }
  },
})
</script>

<template lang="pug">
.h-full.overflow.overflow-x-auto.max-w-3xl.h-full(
  v-if="wallet"
  class="pb-[44px] md_pb-[52px] lg_pb-0"
)
  .flex.items-start
    router-link(
      v-slot='{ href, navigate }'
      :to='`/wallets/${walletId}`'
      custom
    )
      a.grow.cursor-pointer.block.py-5.pb-5.mb-4.px-3.font-nunito.hocus_bg-gray-100.dark_hocus_bg-neutral-800(
        :href='href'
        @click='navigate'
      )
        .pb-1.text-xs.font-medium(class="dark_text-white/50") {{ $t('wallets.editTitle') }}

        .flex.items-center.gap-3
          .text-neutral-800.dark_text-white.text-2xl.font-semibold {{ wallet.name ? wallet.name : $t('wallets.title') }}
          .p-1.px-1.rounded.flex-center.text-2xs.text-neutral-50(
            :style="{ background: wallet.color }"
          ) {{ wallet.currency }}

    .mdi.mdi-delete-empty-outline.cursor-pointer.rounded-full.mt-3.mr-2.w-16.h-16.flex-center.text-2xl.p-4.hocus_text-red-500.hocus_bg-gray-100.dark_hocus_bg-neutral-800(
      @click="isShowDeleteConfirm = true"
    )

  //- Menu
  //-----------------------------------
  .px-3.pb-4
    .overflow-hidden.rounded-md.scrollbar.mb-4.bg-gray-50.dark_bg-dark4.dark_shadow
      .overflow-hidden.overflow-x-auto.flex.items-center.text-sm.text-center.max-w-md
        .cursor-pointer.px-6.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
          :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': activeTab === 'data' }"
          @click="activeTab = 'data'"
        ) {{ $t('categories.form.data.label') }}

        .cursor-pointer.px-6.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
          :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': activeTab === 'currencies' }"
          @click="activeTab = 'currencies'"
        ) {{ $t('wallets.form.currencies.label') }}

        .cursor-pointer.px-6.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
          :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': activeTab === 'colors' }"
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
          type="text"
          v-model="walletForm.name"
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
    template(v-if="activeTab === 'currencies'")
      div
        .border-b.border-gray-50.dark_border-neutral-800.p-3.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
          v-for="(item, currency) in $store.state.currencies.rates"
          :key="item"
          :class="{ '_active cursor-default text-blue3 dark_text-blue1': walletForm.currency === currency }"
          @click="onCurrencySelect(currency)"
        )
          .flex.items-center
            .w-14 {{ currency }}
            .text-sm(
              v-if="currencies.find(c => c.code === currency)"
            ) {{ currencies.find(c => c.code === currency).name }}

    //- Colors
    //---------------------------------
    template(v-if="activeTab === 'colors'")
      .form
        .subTitle {{ $t('popularColors') }}
        .colors
          .iconItem(
            v-for="(color, idx) in popularColors"
            :key="idx"
            :class="{ _active: color === walletForm.color }"
            :style="{ background: color === walletForm.color ? color : 'transparent' }"
            @click="onSelectColor(color)"
          )
            template(v-if="color")
              template(v-if="findWalletWithThisColor(color)")
                Icon(
                  icon="mdi mdi-circle-small"
                  :color="color === walletForm.color ? null : color"
                  big
                )
              template(v-else-if="color === walletForm.color")
                Icon(
                  icon="mdi mdi-circle-small"
                  background="transparent"
                  big
                )
              template(v-else-if="color")
                .colorPreview(:style="{ background: color }")

        .subTitle {{ $t('palette') }}
        .colors
          .iconItem(
            v-for="(color, idx) in allColors"
            :key="idx"
            :class="{ _active: color === walletForm.color, _empty: !color }"
            :style="{ background: color === walletForm.color ? color : 'transparent' }"
            @click="onSelectColor(color)"
          )

            template(v-if="color")
              template(v-if="findWalletWithThisColor(color)")
                Icon(
                  icon="mdi mdi-circle-small"
                  :color="color === walletForm.color ? null : color"
                  big
                )
              template(v-else-if="color === walletForm.color")
                Icon(
                  icon="mdi mdi-circle-small"
                  background="transparent"
                  big
                )
              template(v-else-if="color")
                .colorPreview(:style="{ background: color }")

        .subTitle {{ $t('categories.form.colors.custom') }}
        .customColor
          input.customColor__value(v-model="walletForm.color" type="color")

    .pt-4.pb-6
      SharedButton(
        :class="['_text-center _blue2 _ml-big', { _inline: $store.state.ui.pc }]"
        :title="$t('wallets.form.save')"
        @onClick="onSave"
      )

  ModalBottomConfirm(
    :show="isShowDeleteConfirm"
    :description="deleteDescText"
    @onClose="isShowDeleteConfirm = false"
    @onConfirm="onDeleteConfirm"
  )
</template>

<style lang="stylus" scoped>
.preview
  display flex
  align-items center
  justify-content space-between
  padding $m5 $m7
  gap $m7

.subTitle
  padding 0 $m5
  padding-bottom $m6
  color var(--c-font-4)
  font-size 13px
  font-weight 500

.customColor
  padding 0 $m4
  background var(--c-bg-3)

  &__title
    padding-bottom $m6
    color var(--c-font-4)

  &__value
    overflow hidden
    display block
    appearance none
    width 100%
    height 48px
    margin 0
    padding 0
    background none
    border 0
    border-radius $borderRadiusMd

.form__actions
  @media $media-phone
    text-align center

.form__btns
  display grid
  grid-template-columns repeat(2, 1fr)
  grid-column-gap $m9
  grid-row-gap $m9
  padding-bottom $m9

  +media-laptop()
    grid-column-gap $m10
    grid-row-gap $m10

  &__i._full
    grid-column 1 / -1

.inputModal
  &._flex
    flex 1
    display flex
    align-items center
    justify-content space-between

  &__content
    display flex

  &__label
    margin 0
    padding 0
    font-size 10px

.currencies
  display grid
  grid-template-columns repeat(auto-fill, minmax(120px, 1fr))
  grid-column-gap $m7
  grid-row-gap $m7

  &__item
    cursor pointer
    display flex
    align-items center
    justify-content center
    height 44px
    padding $m6
    text-align center
    border 1px solid var(--c-bg-6)
    border-radius $m4

    +media-hover()
      &:not(._active)
        background var(--c-bg-6)

    &._active
      cursor default
      color var(--c-font-1)
      background var(--c-blue-1)
      border none

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

.customColor
  padding 0 $m4
  background var(--c-bg-3)

  &__title
    padding-bottom $m6
    color var(--c-font-4)

  &__value
    overflow hidden
    display block
    appearance none
    width 100%
    height 48px
    margin 0
    padding 0
    background none
    border 0
    border-radius $borderRadiusMd
</style>

<i18n lang="json5">
{
  "en": {
    "isCredit": "Credit account",
    "askDelete": "Delete wallet?",
  },

  "ru": {
    "isCredit": "Кредитный счёт",
    "askDelete": "Удалить кошелек?",
  }
}
</i18n>
