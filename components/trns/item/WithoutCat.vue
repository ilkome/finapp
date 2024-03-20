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
    class="-mt-[1px] pt-2 px-2 bg-item-4 hocus_bg-item-5 text-secondary"
    @click="onOpenDetails"
  >
    <div
      class="flex items-center gap-4 "
    >
      <div class="min-w-[32px] shrink-0 truncate pt-[1px] text-xs leading-none">
        {{ $t(formatDate(trnItem.date, "trnItem")) }}
      </div>

      <div class="grow flex items-center">
        <div class="grow">
          <div class="flex items-baseline space-x-2">
            <!-- Wallet -->
            <div v-if="trnItem.type !== 2" class="text-xs leading-none">
              {{ trnItem.wallet.name }}
            </div>
          </div>

          <!-- Transfer info -->
          <div v-if="trnItem.type === 2" class="text-sm">
            <div class="flex items-center space-x-1">
              <div class="">
                {{ $t("trnForm.transfer.from") }}:
              </div>
              <div class="">
                {{ trnItem.walletFrom.name }}
              </div>
            </div>
            <div class="flex items-center space-x-1">
              <div class="">
                {{ $t("trnForm.transfer.to") }}:
              </div>
              <div class="">
                {{ trnItem.walletTo.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Amount -->
        <div class="hocus_bg-item-4 px-3 py-1 -mr-1.5 -my-2 rounded-lg">
          <Amount
            :amount="trnItem.amount"
            :currencyCode="trnItem.wallet.currency"
            :type="trnItem.type"
            colorize="income"
            size="base"
            @click="onOpenEdit"
          />
        </div>
      </div>
    </div>

    <!-- Description -->
    <div v-if="trnItem.desc" class="text-xs">
      {{ trnItem.desc }}
    </div>

    <div class="mt-2 h-[1px] bg-item-5" />
  </div>
</template>
