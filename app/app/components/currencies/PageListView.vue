<script setup lang="ts">
import type { CurrencyCode, CurrencyItem } from '~/components/currencies/types'

import { matchesCurrency } from '~/components/currencies/utils'

export type CurrencyRow = {
  code: CurrencyCode
  isBase: boolean
  /** A custom currency (not edited built-in). */
  isCustom: boolean
  isManualRate: boolean
  /** The user's custom currency or an edited built-in one. */
  isOwn: boolean
  /** A wallet holds it; such currencies are listed first, under their own title. */
  isUsed?: boolean
  minorDisplay: NonNullable<CurrencyItem['minorDisplay']>
  name: string
  /** Units of the base currency per one unit, already formatted; null when there is no rate. */
  rate: string | null
  symbol?: string
}

const props = defineProps<{
  /** Already in picker order. */
  rows: CurrencyRow[]
}>()

const emit = defineEmits<{
  add: []
  edit: [code: CurrencyCode]
  setBase: [code: CurrencyCode]
}>()

const { t } = useI18n()

const search = ref('')
const list = computed(() => props.rows.filter(row => matchesCurrency(search.value, row.code, row.name)))
const groups = computed(() => {
  const used = list.value.filter(row => row.isUsed)
  if (!used.length)
    return [{ id: 'all', rows: list.value, title: null }]
  return [
    { id: 'used', rows: used, title: t('currencies.page.used') },
    { id: 'others', rows: list.value.filter(row => !row.isUsed), title: t('currencies.page.others') },
  ].filter(group => group.rows.length)
})

function menuItems(row: CurrencyRow) {
  return [[
    { icon: 'lucide:pencil', label: t('currencies.form.edit'), onSelect: () => emit('edit', row.code) },
    { disabled: row.isBase, icon: 'lucide:star', label: t('currencies.page.setBase'), onSelect: () => emit('setBase', row.code) },
  ]]
}
</script>

<template>
  <div class="grid grid-cols-1 gap-3">
    <div class="flex items-center gap-2">
      <FormInput
        v-model="search"
        :placeholder="`${t('currencies.list.search')}...`"
        class="grow"
      />
      <UButton
        icon="lucide:plus"
        variant="soft"
        :label="t('currencies.form.add')"
        @click="emit('add')"
      />
    </div>

    <UiEmpty v-if="list.length === 0">
      {{ t('currencies.list.notFound') }}
    </UiEmpty>

    <div v-for="group in groups" :key="group.id" class="grid" :data-currency-group="group.id">
      <UiTitleSection v-if="group.title" class="px-2 pb-1">
        {{ group.title }}
      </UiTitleSection>
      <UiContextMenuMy
        v-for="row in group.rows"
        :key="row.code"
        :items="menuItems(row)"
      >
        <UiElement
          :lineWidth="row.isBase ? 6 : 0"
          class="group"
          insideClasses="min-h-11!"
          @click="emit('edit', row.code)"
        >
          <div class="w-12 shrink-0 font-medium">
            {{ row.code }}
          </div>
          <div class="grid min-w-0 grow gap-1">
            <UiEntityName>{{ row.name }}</UiEntityName>
            <UiEntityName v-if="row.symbol || row.minorDisplay !== 'auto'" variant="secondary">
              {{ [row.symbol, row.minorDisplay !== 'auto' && t(`currencies.form.minorDisplay.${row.minorDisplay}`)].filter(Boolean).join(' · ') }}
            </UiEntityName>
          </div>
          <div class="shrink-0 text-right text-sm tabular-nums">
            <span v-if="row.isBase" class="text-xs text-muted opacity-60">
              {{ t('currencies.base') }}
            </span>
            <template v-else-if="row.rate !== null">
              <span v-if="row.isManualRate" class="mr-1 text-xs text-muted">{{ t('currencies.form.manualShort') }}</span>
              {{ row.rate }}
            </template>
            <span v-else class="text-xs text-muted">{{ t('currencies.converter.noRate') }}</span>
          </div>
        </UiElement>
      </UiContextMenuMy>
    </div>
  </div>
</template>
