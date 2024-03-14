<script setup lang="ts">
import useTrn from '~/components/trns/item/useTrn'
import type { TrnId, TrnItem } from '~/components/trns/types'

const props = defineProps<{
  actions: (trnItem: TrnItem) => {
    onOpenDetails: () => void
    onOpenEdit: () => void
  }
  trnId: TrnId
}>()

const { formatTrnItem, formatDate } = useTrn()
const trnItem = computed(() => formatTrnItem(props.trnId))
const { onOpenDetails, onOpenEdit } = props.actions(trnItem.value)
</script>

<template>
  <div
    class="flex cursor-context-menu space-x-4 text-neutral-500 hocus_bg-neutral-100 dark_text-neutral-400 dark_hocus_bg-neutral-800"
    @click="onOpenDetails"
  >
    <div class="min-w-[32px] shrink-0 truncate pt-[1px] text-xs leading-none">
      {{ $t(formatDate(trnItem.date, "trnItem")) }}
    </div>
    <div class="grow">
      <div class="flex">
        <div class="grow">
          <div class="flex items-baseline space-x-2">
            <!-- Wallet -->
            <div v-if="trnItem.type !== 2" class="text-xs leading-none">
              {{ trnItem.wallet.name }}
            </div>
            <!-- Group -->
            <div
              v-if="trnItem.groups"
              class="text-xs leading-none text-neutral-500"
            >
              In group
            </div>
          </div>
          <!-- Transfer info -->
          <div v-if="trnItem.type === 2" class="text-sm">
            <div class="flex items-center space-x-1">
              <div class="text-neutral-600 dark_text-neutral-500">
                {{ $t("trnForm.transfer.from") }}:
              </div>
              <div class="text-neutral-500 dark_text-neutral-400">
                {{ trnItem.walletFrom.name }}
              </div>
            </div>
            <div class="flex items-center space-x-1">
              <div class="text-neutral-600 dark_text-neutral-500">
                {{ $t("trnForm.transfer.to") }}:
              </div>
              <div class="text-neutral-500 dark_text-neutral-400">
                {{ trnItem.walletTo.name }}
              </div>
            </div>
          </div>
        </div>
        <!-- Amount -->
        <div class="cursor-pointer">
          <Amount
            :amount="trnItem.amount"
            :currencyCode="trnItem.wallet.currency"
            :type="trnItem.type"
            colorize="income"
            @click="onOpenEdit"
          />
        </div>
      </div>
      <!-- Description -->
      <div v-if="trnItem.desc" class="pt-1 text-xs text-neutral-500">
        {{ trnItem.desc }}
      </div>
    </div>
  </div>
</template>
