<script setup lang="ts">
import { currencies } from '~/components/currencies/currencies'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  active: string
}>()
const emit = defineEmits(['onSelect'])

const walletsStore = useWalletsStore()
const { active } = toRefs(props)

const searchInput = ref('')
const list = computed(() => {
  if (searchInput.value) {
    const search = searchInput.value.toLowerCase()
    return currencies.filter(
      currency =>
        currency.name.toLowerCase().includes(search)
        || currency.code.toLowerCase().includes(search),
    )
  }

  return currencies
})
</script>

<template>
  <div class="grid h-full grid-rows-[auto,1fr] overflow-hidden">
    <div class="px-2">
      <input
        v-model="searchInput"
        class="text-item-base focus:text-item-1 focus:bg-item-5 focus:border-accent-4 focus:outline-none m-0 w-full rounded-lg border border-solid border-item-5 bg-item-4 px-3 py-2 text-base font-normal transition ease-in-out placeholder_text-item-2"
        placeholder="Search..."
        type="text"
      >
    </div>

    <div
      class="scrollerBlock mt-3 flex flex-col gap-1 overflow-y-auto px-3 pb-3"
    >
      <template v-if="list.length === 0">
        <div class="py-3 text-center">
          {{ $t("notFound") }}
        </div>
      </template>

      <template v-if="!searchInput">
        <div
          v-for="currencyCode in walletsStore.currenciesUsed"
          :key="currencyCode"
          :class="{ '!bg-item-3 text-item-1': currencyCode === active }"
          class="flex cursor-pointer items-center gap-x-3 rounded-md bg-item-4 px-3 py-2 hocus_bg-item-5"
          @click="emit('onSelect', currencyCode)"
        >
          <div class="flex items-center">
            <div class="w-14">
              {{ currencyCode }}
            </div>
            <div
              v-if="currencies.find((c) => c.code === currencyCode)"
              class="text-sm"
            >
              {{ currencies.find((c) => c.code === currencyCode)?.name }}
            </div>
          </div>
        </div>
        <div class="my-2" />
      </template>

      <template v-if="list.length > 0">
        <div
          v-for="currency in list"
          :key="currency.code"
          :class="{ '!bg-item-3 text-item-1': currency.code === active }"
          class="flex cursor-pointer items-center gap-x-3 rounded-md bg-item-4 px-3 py-2 hocus_bg-item-5"
          @click="emit('onSelect', currency.code)"
        >
          <div class="flex items-center">
            <div class="w-14">
              {{ currency.code }}
            </div>
            <div class="text-sm">
              {{ currency.name }}
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<i18n lang="yaml">
en:
  notFound: Currency not found...

ru:
  notFound: Валюта не найдена...
</i18n>
