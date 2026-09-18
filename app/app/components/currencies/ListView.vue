<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

export type CurrencyOption = {
  code: CurrencyCode
  name: string
}

const props = defineProps<{
  active?: string
  /** Every currency the app knows, already named in the active locale. */
  all: CurrencyOption[]
  isHideUnused?: boolean
  isShowAllButton?: boolean
  /** Currencies the user's wallets actually hold, shown first while the search is empty. */
  used: CurrencyOption[]
}>()

const emit = defineEmits<{
  select: [code: CurrencyCode]
}>()

const { t } = useI18n()

const searchInput = ref('')
const list = computed(() => {
  if (!searchInput.value)
    return props.all

  const search = searchInput.value.toLowerCase()
  const searchable = props.isHideUnused ? props.used : props.all

  return searchable.filter(currency =>
    currency.name.toLowerCase().includes(search) || currency.code.toLowerCase().includes(search))
})
</script>

<template>
  <div class="grid h-full grid-rows-[auto_1fr] overflow-hidden px-2">
    <div>
      <FormInput
        v-model="searchInput"
        :placeholder="`${t('currencies.list.search')}...`"
      />
    </div>

    <div class="mt-3 flex scroller-block flex-col gap-6 overflow-y-auto py-px pb-3">
      <template v-if="list.length === 0">
        <div class="py-3 text-center">
          {{ t('currencies.list.notFound') }}
        </div>
      </template>

      <div v-if="props.isShowAllButton">
        <UiElement
          :isActive="props.active === 'all'"
          :lineWidth="6"
          class="group"
          insideClasses="min-h-11!"
          @click="emit('select', 'all')"
        >
          <div class="flex items-center">
            <div class="w-14 pl-1">
              {{ t('currencies.list.all') }}
            </div>

            <div class="text-sm">
              {{ t('currencies.list.showAll') }}
            </div>
          </div>
        </UiElement>
      </div>

      <div v-if="!searchInput">
        <UiElement
          v-for="currency in props.used"
          :key="currency.code"
          :isActive="currency.code === props.active"
          :lineWidth="6"
          class="group"
          insideClasses="min-h-11!"
          @click="emit('select', currency.code)"
        >
          <div class="flex items-center">
            <div class="w-14 pl-1">
              {{ currency.code }}
            </div>

            <!-- An unknown code (crypto) has no localized name, so there is nothing to show beside it. -->
            <div v-if="currency.name !== currency.code" class="text-sm">
              {{ currency.name }}
            </div>
          </div>
        </UiElement>
      </div>

      <div v-if="!props.isHideUnused && list.length > 0">
        <UiElement
          v-for="currency in list"
          :key="currency.code"
          :isActive="currency.code === props.active"
          :lineWidth="6"
          class="group"
          @click="emit('select', currency.code)"
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
