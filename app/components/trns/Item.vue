<script setup lang="ts">
import type { TrnItemFull } from '~/components/trns/types'

import { TrnType } from '~/components/trns/types'

const props = defineProps<{
  alt?: boolean
  date?: string
  trnItem: TrnItemFull
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <UiElement
    v-if="props.trnItem"
    :lineWidth="props.alt ? 3 : 0"
    :insideClasses="`${props.alt ? 'py-2 min-h-[32px]' : 'py-3 !min-h-[38px]'}`"
    @click="emit('click')"
  >
    <template v-if="!alt" #leftIcon>
      <UiIconBase
        :name="props.trnItem.category?.icon"
        :color="props.trnItem.category?.color"
        invert
      />
    </template>

    <div class="grid grow gap-1 pr-1">
      <div class="flex grow items-center gap-3">
        <!-- Alt -->
        <template v-if="alt">
          <div
            v-if="date"
            class="text-2xs min-w-10 truncate leading-none"
          >
            {{ date }}
          </div>

          <div
            v-if="trnItem.type === 2"
            class="flex items-center gap-2"
          >
            <Icon
              :name="props.trnItem.category?.icon"
              :color="props.trnItem.category?.color"
              size="16"
            />
            <div class="text-2 flex items-center gap-2 text-xs leading-none">
              {{ trnItem.category.name }}
            </div>
          </div>
        </template>

        <div
          v-if="trnItem.type !== TrnType.Transfer"
          class="grid grow gap-1"
        >
          <div
            v-if="!alt"
            class="grid grow gap-0.5"
          >
            <CategoriesName
              v-if="trnItem.type !== TrnType.Transfer"
              :category="trnItem.category"
              :parentCategory="trnItem.categoryParent"
              isShowDots
            />
          </div>

          <div
            v-if="trnItem.wallet"
            class="flex items-center gap-2"
          >
            <div class="text-2xs text-4 leading-none">
              {{ trnItem.wallet.name }}
            </div>
          </div>
        </div>

        <Amount
          v-if="trnItem.type !== 2"
          :amount="trnItem.amount"
          :currencyCode="trnItem.wallet?.currency"
          :isShowMinus="trnItem.type === 0"
          :isShowPlus="trnItem.type === 1"
          :type="trnItem.type"
          align="right"
          class="grow"
          colorize="income"
          variant="sm"
        />

        <!-- Transfer -->
        <div
          v-if="trnItem.type === 2"
          class="grid gap-1"
        >
          <div class="text-3 flex items-center gap-1 text-sm leading-none">
            <span class="font-semibold">{{ trnItem.expenseWallet.name }}</span>
            <Icon name="lucide:move-right" size="16" />
            <span class="font-semibold">{{ trnItem.incomeWallet.name }}</span>
          </div>

          <div class="flex flex-wrap gap-2">
            <Amount
              :amount="trnItem.expenseAmount || trnItem.amount"
              :colorize="trnItem.incomeAmount === trnItem.expenseAmount ? '' : 'expense'"
              :currencyCode="trnItem.expenseWallet.currency"
              :type="0"
              class="!flex items-center gap-2"
              variant="sm"
            />

            <template v-if="trnItem.incomeAmount !== trnItem.expenseAmount">
              <Icon name="lucide:" size="16" />

              <Amount
                :amount="trnItem.incomeAmount || trnItem.amount"
                :class="{
                  'opacity-0': trnItem.incomeAmount === trnItem.expenseAmount,
                }"
                :currencyCode="trnItem.incomeWallet.currency"
                :type="1"
                colorize="income"
                class="!flex items-center gap-2"
                variant="sm"
              />
            </template>
          </div>
        </div>
      </div>

      <div
        v-if="trnItem.desc"
        class="text-2xs opacity-80"
      >
        {{ trnItem.desc }}
      </div>
    </div>
  </UiElement>
</template>
