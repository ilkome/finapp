<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { TrnType } from '~/components/trns/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const trnsFormStore = useTrnsFormStore()
const walletsStore = useWalletsStore()

function setAmountType(amountType: TrnType) {
  trnsFormStore.onChangeTrnType(amountType)
}

const items = computed<TabsItem[]>(() => {
  const all: TabsItem[] = [
    { label: t('money.expense'), value: TrnType.Expense },
    { label: t('money.income'), value: TrnType.Income },
  ]

  if (walletsStore.sortedIds.length > 1)
    all.push({ label: t('trnForm.transferTitle'), value: TrnType.Transfer })

  return all
})
</script>

<template>
  <UiTabs
    isEqual
    :items="items"
    :modelValue="trnsFormStore.values.trnType"
    @update:modelValue="(v) => setAmountType(v as TrnType)"
  />
</template>
