<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

import { getCreditAvailable } from '~/components/wallets/types'

const props = defineProps<{
  activeType?: string | false
  counts: Record<string, {
    id: string
    isShow: boolean
    secondValue?: number
    value: number
  }>
  currencyCode: CurrencyCode
  storageKey: string
}>()

const emit = defineEmits<{
  click: [v: string]
}>()

const { t } = useI18n()

const summaryKeys = ['total', 'withdrawal', 'available', 'excludeInTotal', 'archived'] as const
const typeKeys = ['cash', 'cashless', 'deposit', 'credit', 'crypto', 'debt'] as const

const itemsGrouped = computed(() => [
  summaryKeys.map(key => props.counts[key]).filter((i): i is NonNullable<typeof i> => !!i?.isShow),
  typeKeys.map(key => props.counts[key]).filter((i): i is NonNullable<typeof i> => !!i?.isShow),
])
</script>

<template>
  <UiToggleWithStorage
    :initStatus="true"
    :lineWidth="0"
    :storageKey="props.storageKey"
    class="bg-item-2 mb-2 rounded-xl md:max-w-lg"
  >
    <template #header="{ toggle, isShown }">
      <UiTitleCollapse :isShown @click="toggle">
        {{ t('statistics.title') }}
      </UiTitleCollapse>
    </template>

    <div class="grid gap-6">
      <div
        v-for="(items, idx) in itemsGrouped"
        :key="idx"
        class="py-px"
      >
        <UiElement
          v-for="item in items"
          :key="item.id"
          :isActive="props.activeType === item.id"
          :lineWidth="3"
          class="group"
          insideClasses="!min-h-[44px]"
          @click="emit('click', item.id)"
        >
          <div class="text-muted grow pl-1 text-sm leading-none">
            <div>
              {{ t(`money.types.${item.id}`) }}
            </div>

            <div
              v-if="item.secondValue"
              class="flex items-center gap-1 pt-1 opacity-90"
            >
              <Amount
                :amount="getCreditAvailable(item.secondValue, item.value)"
                :currencyCode="currencyCode"
                variant="2xs"
              />
              <div class="text-2xs leading-none opacity-70">
                /
              </div>
              <Amount
                :amount="item.secondValue"
                :currencyCode="currencyCode"
                variant="2xs"
              />
            </div>
          </div>

          <div class="pr-1 opacity-90">
            <Amount
              :amount="item.value"
              :currencyCode="currencyCode"
              variant="sm"
            />
          </div>
        </UiElement>
      </div>
    </div>
  </UiToggleWithStorage>
</template>
