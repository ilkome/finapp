<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

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

const itemsGrouped = computed(() => [
  [props.counts.total, props.counts.withdrawal, props.counts.available, props.counts.excludeInTotal, props.counts.archived].filter(i => i.isShow),
  [props.counts.cash, props.counts.cashless, props.counts.deposit, props.counts.credit, props.counts.crypto, props.counts.debt].filter(i => i.isShow),
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
      <div class="flex grow items-center justify-between">
        <UiTitle8 :isShown @click="toggle">
          {{ t('statistics.title') }}
        </UiTitle8>
      </div>
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
                :amount="item.secondValue - Math.abs(item.value)"
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
