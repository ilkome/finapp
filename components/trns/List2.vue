<script setup lang="ts">
import type { TrnId, TrnItemFull } from '~/components/trns/types'
import useTrn from '~/components/trns/useTrn'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = withDefaults(
  defineProps<{
    alt?: boolean
    isShowFilter?: boolean
    isShowHeader?: boolean
    size?: number
    trnsIds: TrnId[]
  }>(),
  {
    size: 30,
  },
)

const { formatDate, formatTrnItem } = useTrn()
const trnsStore = useTrnsStore()

const isShowWithDesc = ref(false)

const pageNumber = ref(1)
watch(() => props.trnsIds, () => pageNumber.value = 1)

const filteredIds = computed(() => {
  let ids = props.trnsIds

  if (isShowWithDesc.value)
    ids = ids.filter(id => trnsStore.items[id].description || trnsStore.items[id].desc)

  return ids
})

const paginatedTrnsIds = computed(() =>
  filteredIds.value.slice(0, pageNumber.value * props.size),
)

const isShowedAllTrns = computed(() =>
  paginatedTrnsIds.value.length === filteredIds.value.length,
)

const isTrnsWithDescription = computed(() =>
  props.trnsIds.some(id => trnsStore.items[id].description || trnsStore.items[id].desc),
)

const trns = computed(() =>
  paginatedTrnsIds.value
    .map(id => formatTrnItem(id))
    .filter(trn => trn?.id) as TrnItemFull[],
)
</script>

<template>
  <div class="grid gap-3">
    <UiTitle v-if="isShowHeader">
      <div class="flex gap-3 items-baseline">
        <div>{{ $t('trns.title') }}</div>
        <div class="text-xs">
          {{ paginatedTrnsIds.length }} / {{ filteredIds.length }}
        </div>
      </div>
    </UiTitle>

    <div v-if="isShowFilter && isTrnsWithDescription">
      <UiCheckbox
        :checkboxValue="isShowWithDesc"
        :title="$t('trns.filter.showTrnsWithDesc')"
        showCheckbox
        @onClick="isShowWithDesc = !isShowWithDesc"
      />
    </div>

    <div>
      <TrnsItemWrap
        v-for="trnItem in trns"
        :key="trnItem.id"
        :alt="props.alt"
        :trnId="trnItem.id"
        :trnItem="trnItem"
        :date="formatDate(trnItem.date, 'trnItem')"
      />
    </div>

    <div v-if="!isShowedAllTrns">
      <div
        class="flex-center grow rounded-lg bg-item-5 px-5 py-2.5 text-sm text-secondary hocus_bg-item-6"
        @click="pageNumber = ++pageNumber"
      >
        {{ $t("trns.more") }} {{ paginatedTrnsIds.length }} / {{ filteredIds.length }}
      </div>
    </div>
  </div>
</template>
