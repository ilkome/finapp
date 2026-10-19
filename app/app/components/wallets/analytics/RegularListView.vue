<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

export type RegularListItem = {
  amount: number
  categoryId: string
  color: string
  detectedAmount: number
  icon: string
  /** Detected as regular, before any manual change. */
  isAuto: boolean
  /** Included, excluded or amount set by hand. */
  isOverridden: boolean
  isRegular: boolean
  monthsWithSpending: number
  name: string
  parentName?: string
}

const props = defineProps<{
  currencyCode: CurrencyCode
  items: RegularListItem[]
  windowMonths: number
}>()

const emit = defineEmits<{
  edit: [categoryId: string]
  toggle: [categoryId: string]
}>()

const { t } = useI18n()

const isShowOthers = ref(false)
const regular = computed(() => props.items.filter(item => item.isRegular))
const others = computed(() => props.items.filter(item => !item.isRegular))
const total = computed(() => regular.value.reduce((sum, item) => sum + item.amount, 0))
</script>

<template>
  <div class="grid gap-3" data-regular-list>
    <template v-for="group in [{ id: 'regular', items: regular }, { id: 'others', items: others }]" :key="group.id">
      <button
        v-if="group.id === 'others' && others.length"
        type="button"
        class="flex items-center gap-2 rounded-md interactive px-2 py-1.5 text-left text-sm text-muted"
        :aria-expanded="isShowOthers"
        data-regular-others-toggle
        @click="isShowOthers = !isShowOthers"
      >
        <Icon :name="isShowOthers ? 'lucide:chevron-down' : 'lucide:chevron-right'" size="16" />
        {{ t('wallets.analytics.regular.others') }}
        <span class="text-2xs text-dimmed">{{ others.length }}</span>
      </button>

      <div
        v-if="group.items.length && (group.id === 'regular' || isShowOthers)"
        class="grid rounded-md bg-elevated/30 py-px"
        :data-regular-group="group.id"
      >
        <UiElement
          v-for="(item, index) in group.items"
          :key="item.categoryId"
          :lineWidth="index === group.items.length - 1 ? 0 : 3"
          insideClasses="min-h-11!"
          :data-regular-item="item.categoryId"
          @click="emit('edit', item.categoryId)"
        >
          <template #leftIcon>
            <div class="flex size-7 items-center justify-center rounded-full" :style="{ background: item.color }">
              <Icon :name="item.icon" size="16" class="text-white" />
            </div>
          </template>

          <div class="grid min-w-0 grow gap-1">
            <div class="truncate text-sm leading-none text-toned">
              {{ item.name }}
            </div>
            <div class="flex items-center gap-1.5 text-2xs leading-none text-muted">
              <span v-if="item.parentName" class="truncate">{{ item.parentName }} ·</span>
              <span>{{ item.monthsWithSpending }}/{{ props.windowMonths }}</span>
              <UBadge v-if="item.isOverridden" color="neutral" variant="soft" size="sm">
                {{ t('wallets.analytics.regular.manual') }}
              </UBadge>
            </div>
          </div>

          <Amount
            :amount="item.amount"
            :currencyCode="props.currencyCode"
            :isShowBaseRate="false"
            variant="row"
          />

          <USwitch
            :modelValue="item.isRegular"
            size="sm"
            :aria-label="t('wallets.analytics.regular.toggle')"
            data-regular-switch
            @click.stop
            @update:modelValue="emit('toggle', item.categoryId)"
          />
        </UiElement>

        <div v-if="group.id === 'regular'" class="flex items-center gap-3 px-3 py-2.5">
          <UiText variant="meta" class="grow">
            {{ t('wallets.analytics.regular.total') }}
          </UiText>
          <Amount :amount="total" :currencyCode="props.currencyCode" :isShowBaseRate="false" variant="row" />
        </div>
      </div>
    </template>

    <UiText v-if="!props.items.length" variant="meta" class="px-2">
      {{ t('wallets.analytics.regular.empty') }}
    </UiText>
  </div>
</template>
