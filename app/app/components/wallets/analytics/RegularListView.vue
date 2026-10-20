<script setup lang="ts">
import type { CategoryItem } from '~/components/categories/types'
import type { CurrencyCode } from '~/components/currencies/types'
import type { RowBackgroundType } from '~/components/ui/RowBackground.vue'

export type RegularListItem = {
  amount: number
  category: CategoryItem
  categoryId: string
  detectedAmount: number
  /** Detected as regular, before any manual change. */
  isAuto: boolean
  /** Included, excluded or amount set by hand. */
  isOverridden: boolean
  isRegular: boolean
  monthsWithSpending: number
  parentCategory?: CategoryItem
}

const props = defineProps<{
  /** Category rows follow the categories view setting. */
  backgroundType?: RowBackgroundType
  currencyCode: CurrencyCode
  isRoundIcon?: boolean
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
        class="grid gap-1"
        :data-regular-group="group.id"
      >
        <CategoriesRowView
          v-for="item in group.items"
          :key="item.categoryId"
          :category="item.category"
          :categoryId="item.categoryId"
          chevron="more"
          :data-regular-item="item.categoryId"
          :backgroundType="props.backgroundType"
          :isRoundIcon="props.isRoundIcon"
          :parentCategory="item.parentCategory"
          @click="emit('edit', item.categoryId)"
        >
          <template #append>
            <div class="grid justify-items-end gap-1">
              <Amount
                :amount="item.amount"
                :currencyCode="props.currencyCode"
                :isShowBaseRate="false"
                variant="row"
              />
              <div class="flex items-center gap-1.5 text-2xs leading-none text-muted">
                <UBadge v-if="item.isOverridden" color="neutral" variant="soft" size="sm">
                  {{ t('wallets.analytics.regular.manual') }}
                </UBadge>
                <span>{{ item.monthsWithSpending }}/{{ props.windowMonths }}</span>
              </div>
            </div>
            <USwitch
              :modelValue="item.isRegular"
              size="sm"
              :aria-label="t('wallets.analytics.regular.toggle')"
              data-regular-switch
              @click.stop
              @update:modelValue="emit('toggle', item.categoryId)"
            />
          </template>
        </CategoriesRowView>

        <div v-if="group.id === 'regular'" class="flex items-center gap-3 px-3 py-2.5">
          <UiText variant="meta" class="grow">
            {{ t('wallets.analytics.regular.total') }}
          </UiText>
          <Amount :amount="total" :currencyCode="props.currencyCode" :isShowBaseRate="false" variant="row" />
        </div>
      </div>
    </template>

    <UiEmpty v-if="!props.items.length">
      {{ t('wallets.analytics.regular.empty') }}
    </UiEmpty>
  </div>
</template>
