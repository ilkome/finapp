<script setup lang="ts">
import type { RecurrenceId, RecurrenceItem } from '~/components/recurrences/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { addCivilDays, formatByLocale, todayCivilDayEpoch } from '~/components/date/utils'
import { occurrencesInRange } from '~/components/recurrences/occurrences'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { TrnType } from '~/components/trns/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { locale, t } = useI18n()
const recurrencesStore = useRecurrencesStore()
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()

const dateLocale = computed(() => locale.value.startsWith('ru') ? 'ru' : 'en')

const horizons = [30, 60, 90] as const
const horizon = ref<number>(60)

// "Due soon" window: occurrences within a week get highlighted (R6/R3).
const soonCutoff = computed(() => addCivilDays(todayCivilDayEpoch(), 7))

type Occurrence = { day: number, id: RecurrenceId, rule: RecurrenceItem }

// All forward occurrences (tomorrow .. +horizon) across active rules, oldest first.
const occurrences = computed<Occurrence[]>(() => {
  const today = todayCivilDayEpoch()
  const range = { end: addCivilDays(today, horizon.value), start: addCivilDays(today, 1) }
  const out: Occurrence[] = []
  for (const [id, rule] of Object.entries(recurrencesStore.activeItems)) {
    for (const day of occurrencesInRange(rule, range))
      out.push({ day, id, rule })
  }
  return out.sort((a, b) => a.day - b.day)
})

const groups = computed(() => {
  const map = new Map<number, Occurrence[]>()
  for (const o of occurrences.value) {
    const arr = map.get(o.day) ?? []
    arr.push(o)
    map.set(o.day, arr)
  }
  return [...map.entries()].map(([day, items]) => ({ day, items }))
})

const soonCount = computed(() => occurrences.value.filter(o => o.day <= soonCutoff.value).length)

function fmtDay(day: number) {
  return formatByLocale(day, 'EEE, d MMM', dateLocale.value)
}
function categoryOf(rule: RecurrenceItem) {
  return categoriesStore.items?.[rule.categoryId]
}
function walletCurrency(rule: RecurrenceItem) {
  return walletsStore.items?.[rule.walletId]?.currency ?? 'USD'
}
</script>

<template>
  <div v-if="occurrences.length">
    <div class="mb-1 flex items-center gap-2 px-1">
      <UiTextSubtitle class="tracking-wide uppercase">
        {{ t('recurrences.upcoming.title') }}
      </UiTextSubtitle>
      <span v-if="soonCount" class="bg-primary/15 text-primary text-2xs rounded-full px-1.5 py-0.5">
        {{ t('recurrences.upcoming.dueSoon', { count: soonCount }) }}
      </span>
      <span class="grow" />
      <div class="flex gap-1">
        <UiTabsItemPill
          v-for="h in horizons"
          :key="h"
          :isActive="horizon === h"
          variant="outline"
          @click="horizon = h"
        >
          {{ t('recurrences.upcoming.days', { count: h }) }}
        </UiTabsItemPill>
      </div>
    </div>

    <div class="grid gap-2">
      <div v-for="group in groups" :key="group.day">
        <div
          class="text-2xs mb-0.5 px-1"
          :class="group.day <= soonCutoff ? 'text-primary font-medium' : 'text-muted'"
        >
          {{ fmtDay(group.day) }}
        </div>
        <div class="grid gap-1">
          <div
            v-for="o in group.items"
            :key="`${o.id}:${o.day}`"
            class="bg-elevated flex items-center gap-2 rounded-md px-3 py-2"
          >
            <div
              class="flex size-7 shrink-0 items-center justify-center rounded-full"
              :style="{ background: categoryOf(o.rule)?.color ?? 'var(--ui-bg-accented)' }"
            >
              <Icon :name="categoryOf(o.rule)?.icon ?? 'lucide:repeat'" size="15" class="text-white" />
            </div>
            <div class="min-w-0 grow">
              <div class="text-highlighted truncate text-sm">
                {{ categoryOf(o.rule)?.name ?? o.rule.categoryId }}
                <span v-if="o.rule.desc" class="text-muted"> · {{ o.rule.desc }}</span>
              </div>
              <div v-if="!o.rule.autoCreate" class="text-2xs text-muted">
                {{ t('recurrences.manual') }}
              </div>
            </div>
            <Amount
              :amount="o.rule.amount"
              :colorize="o.rule.type === TrnType.Income ? 'income' : undefined"
              :currencyCode="walletCurrency(o.rule)"
              :isShowBaseRate="false"
              :type="o.rule.type"
              variant="sm"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
