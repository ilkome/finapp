<script lang="ts">
import generateId from '~/utils/id'
import { allColors, popularColors } from '~/assets/js/colorsPopular'
import { random } from '~/assets/js/emo'
import { currencies } from '~/components/currencies/currencies'

export default defineComponent({
  setup() {
    console.log(currencies)

    const { $store } = useNuxtApp()
    const activeTab = ref('data')

    const wallet = ref({
      color: $store.state.ui.defaultBgColor,
      countTotal: true,
      currency: 'RUB',
      isCredit: false,
      name: null,
      order: Object.keys($store.state.wallets.items).length || 1,
    })

    function findWalletWithThisColor(color) {
      const wallets = $store.state.wallets.items
      if (wallets) {
        const categoryIdWithThisColor = Object.keys($store.state.wallets.items)?.find(id => wallets[id]?.color === color)
        if (categoryIdWithThisColor)
          return 'mdi mdi-credit-card-multiple'
      }
    }

    function onSelectColor(color) {
      if (color)
        wallet.value.color = color
    }

    return {
      currencies,
      wallet,
      activeTab,
      popularColors,
      allColors,
      onSelectColor,
      findWalletWithThisColor,
    }
  },

  data() {
    return {
      showColors: false,
      showCurrencies: false,
    }
  },

  head() {
    return {
      title: `${this.$t('base.edit')}: ${this.wallet.name}`,
    }
  },

  computed: {
    walletId() {
      return this.$route.params.id
    },
  },

  watch: {
    walletId: {
      handler(walletId) {
        if (walletId) {
          this.wallet = {
            ...this.wallet,
            ...this.$store.state.wallets.items[this.walletId],
          }
        }
      },
      immediate: true,
    },
  },

  created() {
    this.colors = allColors

    this.colors = allColors
    if (!this.walletId)
      this.wallet.color = random(popularColors)
  },

  methods: {
    handleColorSelect(color) {
      this.wallet.color = color
      this.showColors = false
    },
    handleCurrencySelect(currency) {
      this.wallet.currency = currency
      this.showCurrencies = false
    },

    handleSubmit() {
      if (this.validateForm()) {
        const id = this.walletId || generateId()

        const walletsValues = {
          color: this.wallet.color,
          countTotal: this.wallet.countTotal,
          currency: this.wallet.currency,
          isCredit: this.wallet.isCredit,
          name: this.wallet.name,
          order: this.wallet.order,
        }

        this.$store.dispatch('wallets/addWallet', { id, values: walletsValues })
        this.$router.replace(`/wallets/${id}`)
      }
    },

    validateForm() {
      const wallets = this.$store.state.wallets.items
      // name
      if (!this.wallet.name) {
        this.$notify({
          title: '😮',
          text: this.$t('wallets.form.name.error'),
        })
        return false
      }

      // currency
      if (!this.wallet.currency) {
        this.$notify({
          title: '😮',
          text: this.$t('wallets.form.currencies.error'),
        })
        return false
      }

      for (const walletId in wallets) {
        if (wallets[walletId].name === this.wallet.name) {
          if (this.walletId) {
            if (this.walletId !== walletId) {
              this.$notify({
                title: '😮',
                text: this.$t('wallets.form.name.exist'),
              })
              return false
            }
          }
          else {
            this.$notify({
              title: '😮',
              text: this.$t('wallets.form.name.exist'),
            })
            return false
          }
        }
      }

      return true
    },
  },
})
</script>

<template lang="pug">
.h-full.overflow.overflow-x-auto.max-w-3xl.h-full(
  class="pb-[44px] md_pb-[52px] lg_pb-0"
)
  template(v-if="wallet")
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
          .text-neutral-800.dark_text-white.text-2xl.font-semibold {{ wallet.name }}
          .p-1.px-1.rounded.flex-center.text-2xs.text-neutral-50(
            :style="{ background: wallet.color }"
          ) {{ wallet.currency }}

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
          .inputText
            .inputText__label {{ $t('wallets.form.name.label') }}
            input(
              type="text"
              :placeholder="$t('wallets.form.name.placeholder')"
              v-model="wallet.name"
            ).inputText__value

        SharedContextMenuItem(
          :checkboxValue="wallet.countTotal"
          :title="$t('wallets.form.total.placeholder')"
          showCheckbox
          @onClick="wallet.countTotal = !wallet.countTotal"
        )

        SharedContextMenuItem(
          :checkboxValue="wallet.isCredit"
          :title="$t('isCredit')"
          showCheckbox
          @onClick="wallet.isCredit = !wallet.isCredit"
        )

      //- Currencies
      //-----------------------------------
      template(v-if="activeTab === 'currencies'")
        div
          .border-b.border-gray-50.dark_border-neutral-800.p-3.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
            v-for="(item, currency) in $store.state.currencies.rates"
            :key="item"
            :class="{ '_active cursor-default text-blue3 dark_text-blue1': wallet.currency === currency }"
            @click="handleCurrencySelect(currency)"
          )
            .flex.items-center
              template(v-if="currencies.find(c => c.code === currency)")
                .grow {{ currencies.find(c => c.code === currency).currency }}
                div {{ currency }}

              template(v-else)
                .grow
                div {{ currency }}

      //- Colors
      //---------------------------------
      template(v-if="activeTab === 'colors'")
        .form
          .subTitle {{ $t('popularColors') }}
          .colors
            .iconItem(
              v-for="(color, idx) in popularColors"
              :key="idx"
              :class="{ _active: color === wallet.color }"
              :style="{ background: color === wallet.color ? color : 'transparent' }"
              @click="onSelectColor(color)"
            )
              template(v-if="color")
                template(v-if="findWalletWithThisColor(color)")
                  Icon(
                    icon="mdi mdi-credit-card-multiple"
                    :color="color === wallet.color ? null : color"
                    big
                  )
                template(v-else-if="color === wallet.color")
                  Icon(
                    icon="mdi mdi-credit-card-multiple"
                    background="transparent"
                    big
                  )
                template(v-else)
                  .colorPreview(:style="{ background: color }")

          .subTitle {{ $t('palette') }}
          .colors
            .iconItem(
              v-for="(color, idx) in allColors"
              :key="idx"
              :class="{ _active: color === wallet.color, _empty: !color }"
              :style="{ background: color === wallet.color ? color : 'transparent' }"
              @click="onSelectColor(color)"
            )

              template(v-if="color")
                template(v-if="findWalletWithThisColor(color)")
                  Icon(
                    icon="mdi mdi-credit-card-multiple"
                    :color="color === wallet.color ? null : color"
                    big
                  )
                template(v-else-if="color === wallet.color")
                  Icon(
                    icon="mdi mdi-credit-card-multiple"
                    background="transparent"
                    big
                  )
                template(v-else)
                  .colorPreview(:style="{ background: color }")

          .subTitle {{ $t('categories.form.colors.custom') }}
          .customColor
            input.customColor__value(v-model="wallet.color" type="color")

      .pt-4.pb-6
        SharedButton(
          :class="['_text-center _blue2 _ml-big', { _inline: $store.state.ui.pc }]"
          :title="$t('wallets.form.save')"
          @onClick="handleSubmit()"
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
    "isCredit": "Credit account"
  },
  "ru": {
    "isCredit": "Кредитный счёт"
  }
}
</i18n>
