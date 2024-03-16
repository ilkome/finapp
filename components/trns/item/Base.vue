<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { TrnId } from '~/components/trns/types'
import { useFilter } from '~/components/filter/useFilter'
import useTrn from '~/components/trns/item/useTrn'
import { useTrnForm } from '~/components/trnForm/useTrnForm'
import { useAppNav } from '~/components/app/useAppNav'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  trnId: TrnId
  slider?: any
}>()
const emit = defineEmits(['onClickEdit'])

const { trnFormEdit } = useTrnForm()
const { activeTabStat } = storeToRefs(useAppNav())
const trnsStore = useTrnsStore()
const filterStore = useFilter()
const { formatTrnItem } = useTrn()
const trnItem = computed(() => formatTrnItem(props.trnId))

const actions = {
  onOpenDetails: () => {
    if (!useTrnsStore.isShownModal) {
      trnsStore.showTrnModal()
      trnsStore.setTrnModalId(trnItem.value.id)
    }
  },

  onOpenEdit: (event) => {
    event.stopPropagation()

    if (props.slider)
      props.slider.slideTo(1)

    trnFormEdit(props.trnId)
    emit('onClickEdit', props.trnId)
  },

  // TODO: useFilter
  onSetFilter: (event) => {
    if (props.slider)
      return

    event.stopPropagation()
    filterStore.setCategoryId(trnItem.value.categoryId)
    filterStore.setDateNow()
    trnsStore.hideTrnModal()
    trnsStore.setTrnModalId(null)
    if (activeTabStat.value !== 'trns')
      activeTabStat.value = 'summary'
  },
}
</script>

<template>
  <div
    class="group flex space-x-3 rounded-md px-2 py-2 hocus_bg-item-5"
    @click="actions.onOpenDetails"
  >
    <Icon2
      :categoryId="trnItem.categoryId"
      :color="trnItem.category.color"
      :icon="trnItem.category.icon"
      @click="actions.onSetFilter"
    />

    <div class="flex grow items-center">
      <div class="grow text-neutral-500 dark_text-neutral-500">
        <div class="flex flex-wrap items-baseline space-x-2 pb-1">
          <div class="text-sm text-neutral-700 dark_text-neutral-300">
            {{ trnItem.category.name }}
          </div>

          <div
            v-if="trnItem.category.parentId"
            class="flex items-baseline space-x-2 text-xs"
          >
            <div>•</div>
            <div>{{ trnItem.categoryParent.name }}</div>
          </div>
        </div>

        <div v-if="trnItem.type !== 2" class="text-xs leading-none">
          {{ trnItem.wallet.name }}
        </div>

        <div
          v-if="trnItem.type === 2"
          class="wrap flex gap-4 text-left text-xs"
        >
          <div>
            <div class="flex items-center space-x-1">
              <div>{{ $t("trnForm.transfer.from") }}:</div>
              <div class="text-neutral-500 dark_text-neutral-400">
                {{ trnItem.expenseWallet.name }}
              </div>
            </div>

            <div class="text-base" @click="actions.onOpenEdit">
              <Amount
                :amount="trnItem.expenseAmount || trnItem.amount"
                :currencyCode="trnItem.expenseWallet.currency"
                :type="0"
                colorize="expense"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center space-x-1">
              <div>{{ $t("trnForm.transfer.to") }}:</div>
              <div class="text-neutral-500 dark_text-neutral-400">
                {{ trnItem.incomeWallet.name }}
              </div>
            </div>

            <div class="text-base" @click="actions.onOpenEdit">
              <Amount
                :amount="trnItem.incomeAmount || trnItem.amount"
                :currencyCode="trnItem.incomeWallet.currency"
                :type="1"
                colorize="income"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="trnItem.type !== 2"
        class="cursor-pointer"
        @click="actions.onOpenEdit"
      >
        <Amount
          :amount="trnItem.amount"
          :currencyCode="trnItem.wallet.currency"
          :type="trnItem.type"
          colorize="income"
        />
      </div>
    </div>

    <div
      v-if="trnItem.desc || trnItem.description"
      class="pt-2 text-xs leading-none text-neutral-500"
    >
      {{ trnItem.desc || trnItem.description }}
    </div>
  </div>
</template>
