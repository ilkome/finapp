<script setup lang="ts">
import { currencies } from '~/components/currencies/currencies'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  active: string
  isShowAll?: boolean
}>()
const emit = defineEmits(['onSelect'])

const { t } = useI18n()
const walletsStore = useWalletsStore()
const { active } = toRefs(props)

const searchInput = ref('')
const list = computed(() => {
  if (!searchInput.value)
    return currencies

  const search = searchInput.value.toLowerCase()
  return currencies.filter(
    currency =>
      currency.name.toLowerCase().includes(search)
      || currency.code.toLowerCase().includes(search),
  )
})
</script>

<template>
  <div class="grid h-full grid-rows-[auto,1fr] overflow-hidden max-h-[60vh]">
    <div>
      <input
        v-model="searchInput"
        class="text-item-base focus:text-item-1 focus:bg-item-5 focus:border-accent-4 focus:outline-none m-0 w-full rounded-lg border border-solid border-item-5 bg-item-4 px-3 py-2 text-base font-normal transition ease-in-out placeholder:text-item-2"
        placeholder="Search..."
        type="text"
      >
    </div>

    <div
      class="scrollerBlock mt-3 flex flex-col gap-6 overflow-y-auto pb-3"
    >
      <template v-if="list.length === 0">
        <div class="py-3 text-center">
          {{ $t("notFound") }}
        </div>
      </template>

      <div v-if="props.isShowAll">
        <UiElement
          :isActive="active === 'all'"
          isShowLine
          insideClasses="!min-h-[44px]"
          @click="emit('onSelect', 'all')"
        >
          <div class="flex items-center">
            <div class="w-14 pl-1">
              {{ t("all") }}
            </div>

            <div class="text-sm">
              {{ t("showAll") }}
            </div>
          </div>
        </UiElement>
      </div>

      <div v-if="!searchInput">
        <UiElement
          v-for="currencyCode in walletsStore.currenciesUsed"
          :key="currencyCode"
          :isActive="currencyCode === active"
          isShowLine
          class="group"
          insideClasses="!min-h-[44px]"
          @click="emit('onSelect', currencyCode)"
        >
          <div class="flex items-center">
            <div class="w-14 pl-1">
              {{ currencyCode }}
            </div>

            <div
              v-if="currencies.find((c) => c.code === currencyCode)"
              class="text-sm"
            >
              {{ currencies.find((c) => c.code === currencyCode)?.name }}
            </div>
          </div>
        </UiElement>
      </div>

      <div v-if="list.length > 0">
        <UiElement
          v-for="currency in list"
          :key="currency.code"
          :isActive="currency.code === active"
          class="group"
          isShowLine
          @click="emit('onSelect', currency.code)"
        >
          <div class="flex items-center">
            <div class="w-14 pl-1">
              {{ currency.code }}
            </div>
            <div class="text-sm">
              {{ currency.name }}
            </div>
          </div>
        </UiElement>
      </div>
    </div>
  </div>
</template>

<i18n lang="yaml">
en:
  all: All
  showAll: Show all wallets
  notFound: Currency not found...

ru:
  all: Все
  showAll: Показать все кошельки
  notFound: Валюта не найдена...
</i18n>
