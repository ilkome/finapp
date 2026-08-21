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

const shown = useStoredToggle(props.storageKey, true)
</script>

<template>
  <div class="group relative mb-2 rounded-xl bg-elevated/30 md:max-w-lg">
    <div class="-my-px overflow-hidden">
      <UCollapsible v-model:open="shown">
        <div class="flex min-h-10.5 items-center rounded-sm interactive">
          <UiTitleCollapse :isShown="shown">
            {{ t('statistics.title') }}
          </UiTitleCollapse>
        </div>

        <template #content>
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
                insideClasses="min-h-11!"
                @click="emit('click', item.id)"
              >
                <div class="grow pl-1 text-sm leading-none text-muted">
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
        </template>
      </UCollapsible>
    </div>
  </div>
</template>
