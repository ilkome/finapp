<script setup lang="ts">
import type { TrnItemFull } from '~/components/trns/types'

const props = defineProps<{
  alt?: boolean
  date?: string
  trnItem: TrnItemFull
}>()
</script>

<template>
  <UiElement
    v-if="props.trnItem"
    insideClasses="py-3 !min-h-[44px]"
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
        <template v-if="alt">
          <div
            v-if="date"
            class="text-2xs truncate leading-none"
          >
            {{ date }}
          </div>

          <div
            v-if="trnItem.type === 2"
            class="flex items-center gap-2"
          >
            <Icon
              :name="props.trnItem.category?.icon?.replace('mdi mdi-', 'mdi:')"
              :color="props.trnItem.category?.color"
              size="16"
            />
            <div
              class="text-secondary flex items-center gap-2 text-xs leading-none"
            >
              {{ trnItem.category.name }}
            </div>
          </div>
        </template>

        <div class="grid grow gap-1">
          <div
            v-if="!alt"
            class="text-3 grid grow gap-0.5"
          >
            <CategoriesName
              :category="trnItem.category"
              :parentCategory="trnItem.categoryParent"
              isHideDots
            />
          </div>

          <div
            v-if="trnItem.wallet"
            class="flex items-center gap-2"
          >
            <div class="text-4 text-xs leading-none">
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
        />

        <div
          v-if="trnItem.type === 2"
          class="grid"
          :class="{
            'gap-2': trnItem.incomeAmount !== trnItem.expenseAmount,
          }"
        >
          <div class="flex justify-end gap-3">
            <div class="text-xs">
              {{ $t("trnForm.transfer.from") }} {{ trnItem.expenseWallet.name }}
            </div>

            <Amount
              :amount="trnItem.expenseAmount || trnItem.amount"
              :currencyCode="trnItem.expenseWallet.currency"
              :type="0"
              :colorize="trnItem.incomeAmount === trnItem.expenseAmount ? '' : 'expense'"
            />
          </div>

          <div
            class="flex justify-end gap-3"
          >
            <div class="text-xs">
              {{ $t("trnForm.transfer.to") }} {{ trnItem.incomeWallet.name }}
            </div>

            <Amount
              :amount="trnItem.incomeAmount || trnItem.amount"
              :class="{
                'opacity-0': trnItem.incomeAmount === trnItem.expenseAmount,
              }"
              :currencyCode="trnItem.incomeWallet.currency"
              :type="1"
              colorize="income"
            />
          </div>
        </div>
      </div>

      <div
        v-if="trnItem.desc || trnItem.description"
        class="text-2xs opacity-80"
      >
        {{ trnItem.desc || trnItem.description }}
      </div>
    </div>
  </UiElement>
</template>
