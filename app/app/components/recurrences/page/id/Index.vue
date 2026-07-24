<script setup lang="ts">
import { differenceInDays } from 'date-fns'

import type { RecurrenceId } from '~/components/recurrences/types'
import type { StatTabSlug } from '~/components/stat/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useStatDate } from '~/components/date/useStatDate'
import { calculateBestIntervalsBy } from '~/components/date/utils'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { useFilter } from '~/components/stat/filter/useFilter'
import { filterKey, statConfigKey, statDateKey } from '~/components/stat/injectionKeys'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const recurrencesStore = useRecurrencesStore()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()
const filter = useFilter()
provide(filterKey, filter)

const id = computed(() => route.params.id as RecurrenceId)
const rule = computed(() => recurrencesStore.items?.[id.value])
const category = computed(() => (rule.value ? categoriesStore.items?.[rule.value.categoryId] : undefined))

// A subscription is a single direction (expense or income): force the tab, hide the switcher.
const activeTab = computed<StatTabSlug>(() => (rule.value?.type === TrnType.Income ? 'income' : 'expense'))
// Key by id only: the tab is derived (not user-switchable), and it can flip once the rule loads,
// which would otherwise leave the stat config/date keyed to the wrong (initial) tab.
const storageKey = computed(() => `page-recurrence-${id.value}`)

// Its transactions are the materialized occurrence trns, matched by recurrenceId.
const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  recurrenceIds: [id.value],
  walletsIds: filter?.walletsIds?.value ?? [],
}))
const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

const statConfig = useStatConfig({ storageKey: storageKey.value })
provide(statConfigKey, statConfig)

const statDate = useStatDate({
  initParams: {
    intervalsBy: calculateBestIntervalsBy(maxRange.value),
    intervalsDuration: 1,
    isShowMaxRange: true,
    isSkipEmpty: true,
    rangeBy: 'day',
    rangeDuration: differenceInDays(maxRange.value.end, maxRange.value.start),
  },
  key: storageKey.value,
  maxRange,
  queryParams: route.query,
})
provide(statDateKey, statDate)

// Rule deleted (here or synced away from another device) -> back to the list.
watch(rule, (r) => {
  if (recurrencesStore.isLoaded && !r)
    router.replace('/recurrences')
})

useHead({ title: () => category.value?.name ?? t('recurrences.title') })

const isEditing = ref(false)
const isDeleting = ref(false)

function onEdit(close: () => void) {
  close()
  isEditing.value = true
}
function onToggleStatus(close: () => void) {
  close()
  if (rule.value)
    recurrencesStore.setStatus(id.value, rule.value.status === 'active' ? 'paused' : 'active')
}
function onDelete(close: () => void) {
  close()
  isDeleting.value = true
}
function onDeleteConfirm() {
  router.push('/recurrences')
  recurrencesStore.removeRecurrence(id.value)
}
</script>

<template>
  <UiPage v-if="rule">
    <StatHeader
      v-model:activeTab="activeTab"
      backTo="/recurrences"
      :hasCategoryBreakdown="false"
      hideTabs
      :trnsIds
    >
      <template #title>
        <RecurrencesHeader :rule="rule" />
      </template>

      <template #popover="{ close }">
        <UiHeaderLink icon="lucide:pencil" @click="onEdit(close)">
          {{ t('base.edit') }}
        </UiHeaderLink>

        <UiHeaderLink
          :icon="rule.status === 'active' ? 'lucide:pause' : 'lucide:play'"
          @click="onToggleStatus(close)"
        >
          {{ t(rule.status === 'active' ? 'recurrences.actions.pause' : 'recurrences.actions.resume') }}
        </UiHeaderLink>

        <UiHeaderLink icon="lucide:trash-2" @click="onDelete(close)">
          {{ t('base.delete') }}
        </UiHeaderLink>
      </template>
    </StatHeader>

    <StatWrap
      :activeTab
      :categoryId="rule.categoryId"
      :storageKey
      :trnsIds
    />

    <div class="max-w-3xl px-2 pb-10 lg:px-4">
      <RecurrencesPayments
        :filterId="id"
        @clearFilter="router.push('/recurrences')"
      />
    </div>

    <RecurrencesForm
      v-if="isEditing"
      :recurrenceId="id"
      @closed="isEditing = false"
    />

    <LayoutConfirmModal
      v-if="isDeleting"
      :title="t('recurrences.confirm.deleteTitle')"
      :description="t('recurrences.confirm.deleteText')"
      @closed="isDeleting = false"
      @confirm="onDeleteConfirm"
    />
  </UiPage>
</template>
