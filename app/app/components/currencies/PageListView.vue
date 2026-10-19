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

function menuItems(row: CurrencyRow) {
  return [[
    { icon: 'lucide:pencil', label: t('currencies.form.edit'), onSelect: () => emit('edit', row.code) },
    { disabled: row.isBase, icon: 'lucide:star', label: t('currencies.page.setBase'), onSelect: () => emit('setBase', row.code) },
  ]]
}
</script>

<template>
  <div class="grid gap-3">
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

    <div v-if="list.length === 0" class="py-6 text-center text-sm text-muted">
      {{ t('currencies.list.notFound') }}
    </div>

    <div>
      <UiContextMenuMy
        v-for="row in list"
        :key="row.code"
        :items="menuItems(row)"
      >
        <UiElement
          :lineWidth="row.isBase ? 6 : 0"
          class="group"
          insideClasses="min-h-11!"
          @click="emit('edit', row.code)"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <div class="w-14 shrink-0 font-medium">
                {{ row.code }}
              </div>
              <div class="truncate text-sm text-muted">
                <span v-if="row.name !== row.code">{{ row.name }}</span>
                <span v-if="row.symbol" class="ml-1 opacity-60">{{ row.symbol }}</span>
                <span v-if="row.minorDisplay !== 'auto'" class="ml-2 text-xs opacity-60">
                  {{ t(`currencies.form.minorDisplay.${row.minorDisplay}`) }}
                </span>
              </div>
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
          </div>
        </UiElement>
      </UiContextMenuMy>
    </div>
  </div>
</template>
