<script setup lang="ts">
import { civilDayStart, formatByLocale, todayCivilDayEpoch } from '~/components/date/utils'
import { recurrenceEveryLabel } from '~/components/recurrences/format'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const { locale, t } = useI18n()
const trnsFormStore = useTrnsFormStore()
const repeat = computed(() => trnsFormStore.repeat)
const isShow = ref(false)

const dateLocale = computed(() => locale.value.startsWith('ru') ? 'ru' : 'en')

// The trn's date is the subscription start. Editing this field moves the transaction date.
const isCreate = computed(() => !trnsFormStore.values.trnId)
const isFutureStart = computed(() => civilDayStart(trnsFormStore.values.date) > todayCivilDayEpoch())
const isPastStart = computed(() => civilDayStart(trnsFormStore.values.date) < todayCivilDayEpoch())
const startLabel = computed(() => formatByLocale(trnsFormStore.values.date, 'd MMM yyyy', dateLocale.value))

const startDate = computed({
  get: () => trnsFormStore.values.date,
  set: (v: number | null) => {
    if (v != null)
      trnsFormStore.values.date = v
  },
})

const summary = computed(() => {
  const r = repeat.value
  const parts = [recurrenceEveryLabel(t, r.freq, r.interval)]
  if (r.freq === 'month' && r.monthLastDay)
    parts.push(t('recurrences.form.monthLastDay').toLowerCase())
  if (r.endMode === 'date' && r.endDate != null)
    parts.push(`${t('recurrences.summary.until')} ${formatByLocale(r.endDate, 'd MMM yyyy', dateLocale.value)}`)
  else if (r.endMode === 'count' && r.endCount)
    parts.push(`${r.endCount}×`)
  return parts.join(' · ')
})
</script>

<template>
  <BottomSheetOrDropdown
    :isOpen="isShow"
    :title="t('recurrences.form.repeat')"
    class="shrink-0 !grow-0"
    dragClassesCustom="bottomSheetDragClassesCustom"
    isShowCloseBtn
    @closeModal="isShow = false"
    @openModal="isShow = true"
  >
    <template #trigger>
      <UiActionButton class="relative overflow-visible">
        <Icon name="lucide:repeat" size="20" />
        <div
          v-if="repeat.enabled"
          class="bg-primary absolute top-0 right-0 aspect-square w-2.5 rounded-full"
        />
      </UiActionButton>
    </template>

    <template #content>
      <div class="grid min-w-80 gap-3 px-2 pb-4 md:pb-0">
        <button
          type="button"
          class="bg-elevated flex w-full items-center gap-2 rounded-md px-3 py-2 text-left"
          @click="repeat.enabled = !repeat.enabled"
        >
          <Icon name="lucide:repeat" size="18" class="text-muted" />
          <div class="grow">
            <div class="text-highlighted text-sm">
              {{ t('recurrences.form.repeat') }}
            </div>
            <div v-if="repeat.enabled" class="text-2xs text-muted">
              {{ summary }}
            </div>
          </div>
          <div
            :class="repeat.enabled ? 'bg-primary' : 'bg-accented'"
            class="relative h-5 w-9 rounded-full transition"
          >
            <div
              :class="repeat.enabled ? 'translate-x-4' : ''"
              class="absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition"
            />
          </div>
        </button>

        <div v-if="repeat.enabled" class="grid gap-3">
          <div v-if="isCreate" class="grid gap-1">
            <div class="text-muted text-sm">
              {{ t('recurrences.form.startDate') }}
            </div>
            <FormDate v-model="startDate" />
          </div>

          <div v-if="isFutureStart" class="bg-default text-2xs text-muted flex items-center gap-1.5 rounded-sm px-2 py-1.5">
            <Icon name="lucide:clock" size="14" />
            {{ t('recurrences.form.futureStart', { date: startLabel }) }}
          </div>

          <div v-if="isCreate && isPastStart" class="grid gap-1">
            <label class="text-muted flex items-center gap-2 text-sm">
              <input v-model="repeat.backfill" type="checkbox" class="size-4">
              {{ t('recurrences.form.backfill') }}
            </label>
            <div class="text-2xs text-muted pl-6">
              {{ repeat.backfill ? t('recurrences.form.backfillOnHint') : t('recurrences.form.backfillOffHint') }}
            </div>
          </div>

          <RecurrencesScheduleEditor v-model="trnsFormStore.repeat" />
        </div>
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
