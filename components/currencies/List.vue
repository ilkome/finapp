<script setup lang="ts">
import { currencies } from '~/components/currencies/currencies'
import useWallets from '~/components/wallets/useWallets'

const props = defineProps<{
  active: string
}>()
const emit = defineEmits(['onSelect'])

const { walletsCurrencies } = useWallets()
const { active } = toRefs(props)

const searchInput = ref('')
const list = computed(() => {
  if (searchInput.value) {
    const search = searchInput.value.toLowerCase()
    return currencies.filter(currency =>
      currency.name.toLowerCase().includes(search) || currency.code.toLowerCase().includes(search))
  }

  return currencies
})
</script>

<template lang="pug">
.overflow-hidden.h-full.grid(
  class="grid-rows-[auto,1fr]"
)
  .px-2
    input.w-full.m-0.py-2.px-3.rounded-lg.text-base.font-normal.text-item-base.bg-item-4.border.border-solid.border-item-5.placeholder_text-item-2.transition.ease-in-out.focus_text-item-1.focus_bg-item-5.focus_border-accent-4.focus_outline-none(
      placeholder="Search..."
      v-model="searchInput"
      type="text"
    )

  .overflow-y-auto.mt-3.pb-3.px-3.flex.flex-col.gap-1.scrollerBlock
    template(v-if="list.length === 0")
      .py-3.text-center {{ $t('notFound') }}

    template(v-if="!searchInput")
      .cursor-pointer.py-2.px-3.gap-x-3.flex.items-center.rounded-md.bg-item-4.hocus_bg-item-5(
        v-for="currencyCode in walletsCurrencies"
        :key="currencyCode"
        :class="{ '!cursor-default text-item-1 !bg-item-3': currencyCode === active }"
        @click="emit('onSelect', currencyCode, close)"
      )
        .flex.items-center
          .w-14 {{ currencyCode }}
          .text-sm(
            v-if="currencies.find(c => c.code === currencyCode)"
          ) {{ currencies.find(c => c.code === currencyCode).name }}

      .my-2

    template(v-if="list.length > 0")
      .cursor-pointer.py-2.px-3.gap-x-3.flex.items-center.rounded-md.bg-item-4.hocus_bg-item-5(
        v-for="currency in list"
        :key="currency.code"
        :class="{ '!cursor-default text-item-1 !bg-item-3': currency.code === active }"
        @click="emit('onSelect', currency.code, close)"
      )
        .flex.items-center
          .w-14 {{ currency.code }}
          .text-sm {{ currency.name }}
</template>

<i18n lang="yaml">
en:
  notFound: Currency not found...

ru:
  notFound: Валюта не найдена...
</i18n>
