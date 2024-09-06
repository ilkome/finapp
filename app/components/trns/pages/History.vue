<script setup lang="ts">
import { useFilter } from '~/components/filter/useFilter'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const filter = useFilter()
const trnsStore = useTrnsStore()
const walletsStore = useWalletsStore()

useHead({
  title: t('trns.history'),
})

const trnsIds = computed(() => filter.getTrnsIdsWithFilter())

provide('filter', filter)

const columns = [
  {
    direction: 'desc' as const,
    key: 'date',
    label: 'date',
    sortable: true,
  },
  {
    direction: 'desc' as const,
    key: 'id',
    label: 'ID',
    sortable: true,
  },
  {
    key: 'wallet',
    label: 'Wallet',
    sortable: true,
  },
  {
    key: 'amount',
    label: 'Amount',
    sortable: true,
  },
  {
    key: 'actions',
  },
]

const people = computed(() => trnsIds.value.map((id) => {
  const trn = trnsStore.items[id]
  return {
    amount: trn.amount,
    date: trn.date,
    id,
    wallet: walletsStore.items[trn.walletId]?.name,
  }
}))

const selected = ref([])

function items(row) {
  return [
    [
      {
        click: () => console.log('Edit', row.id),
        icon: 'i-heroicons-pencil-square-20-solid',
        label: 'Edit',
      },
      {
        icon: 'i-heroicons-document-duplicate-20-solid',
        label: 'Duplicate',
      },
    ],
    [
      {
        icon: 'i-heroicons-archive-box-20-solid',
        label: 'Archive',
      },
      {
        icon: 'i-heroicons-arrow-right-circle-20-solid',
        label: 'Move',
      },
    ],
    [
      {
        icon: 'i-heroicons-trash-20-solid',
        label: 'Delete',
      },
    ],
  ]
}

function select(row) {
  const index = selected.value.findIndex(item => item.id === row.id)
  if (index === -1) {
    selected.value.push(row)
  }
  else {
    selected.value.splice(index, 1)
  }
}
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ $t("trns.history") }}</UiHeaderTitle>
    </UiHeader>

    <div class="grid gap-3 px-2">
      <Filter class="flex gap-1" />

      <TrnsList
        :trnsIds
        isShowHeader
        isShowGroupSum
        isShowFilterByType
        isShowFilterByDesc
      />
    </div>
  </UiPage>
</template>
