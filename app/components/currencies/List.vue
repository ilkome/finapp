<script setup lang="ts">
import { currencies } from '~/components/currencies/currencies'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  active?: string
  isHideUnused?: boolean
  isShowAllButton?: boolean
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
  const searchableCurrencies = props.isHideUnused ? currencies.filter(currency => walletsStore.currenciesUsed.includes(currency.code)) : currencies

  return searchableCurrencies.filter(
    currency =>
      currency.name.toLowerCase().includes(search)
      || currency.code.toLowerCase().includes(search),
  )
})
</script>

<template>
  <div class="grid h-full grid-rows-[auto_1fr] overflow-hidden px-2">
    <div>
      <FormInput
        :value="searchInput"
        :placeholder="`${t('search')}...`"
        @updateValue="(value: string) => searchInput = value"
      />
    </div>

    <div class="scrollerBlock mt-3 flex flex-col gap-6 overflow-y-auto py-px pb-3">
      <template v-if="list.length === 0">
        <div class="py-3 text-center">
          {{ t('notFound') }}
        </div>
      </template>

      <div v-if="props.isShowAllButton">
        <UiElement
          :isActive="active === 'all'"
          :lineWidth="6"
          class="group"
          insideClasses="!min-h-[44px]"
          @click="emit('onSelect', 'all')"
        >
          <div class="flex items-center">
            <div class="w-14 pl-1">
              {{ t('all') }}
            </div>

            <div class="text-sm">
              {{ t('showAll') }}
            </div>
          </div>
        </UiElement>
      </div>

      <div v-if="!searchInput">
        <UiElement
          v-for="currencyCode in walletsStore.currenciesUsed"
          :key="currencyCode"
          :isActive="currencyCode === active"
          :lineWidth="6"
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

      <div v-if="!props.isHideUnused && list.length > 0">
        <UiElement
          v-for="currency in list"
          :key="currency.code"
          :isActive="currency.code === active"
          :lineWidth="6"
          class="group"
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
  notFound: Currency not found...
  search: Search
  showAll: Show all wallets

ru:
  all: Все
  notFound: Валюта не найдена...
  search: Поиск
  showAll: Показать все кошельки
</i18n>
