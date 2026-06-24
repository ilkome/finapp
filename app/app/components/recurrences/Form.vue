<script setup lang="ts">
import type { RecurrenceEndMode, RecurrenceFreq, RecurrenceId, RecurrenceItem } from '~/components/recurrences/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { civilDayKey, toCivilDayEpoch } from '~/components/date/utils'
import { recurrenceFreqs } from '~/components/recurrences/types'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  recurrenceId: RecurrenceId
}>()

const emit = defineEmits<{
  closed: []
}>()

const { t } = useI18n()
const recurrencesStore = useRecurrencesStore()
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()

const existing = computed(() => recurrencesStore.items?.[props.recurrenceId])
const category = computed(() => existing.value ? categoriesStore.items?.[existing.value.categoryId] : undefined)
const wallet = computed(() => existing.value ? walletsStore.items?.[existing.value.walletId] : undefined)

// Editable schedule fields (category/wallet/type stay fixed - they define the series identity).
const amount = ref<string>(existing.value ? String(existing.value.amount) : '')
const freq = ref<RecurrenceFreq>(existing.value?.freq ?? 'month')
const interval = ref<number>(existing.value?.interval ?? 1)
const monthLastDay = ref<boolean>(existing.value?.monthLastDay ?? false)
const autoCreate = ref<boolean>(existing.value?.autoCreate ?? true)
const endMode = ref<RecurrenceEndMode>(existing.value?.endMode ?? 'never')
const endCount = ref<number | null>(existing.value?.endCount ?? null)
const endDateEpoch = ref<number | null>(existing.value?.endDate ?? null)

const endDateInput = computed({
  get: () => (endDateEpoch.value != null ? civilDayKey(endDateEpoch.value) : ''),
  set: (v: string) => {
    if (!v) {
      endDateEpoch.value = null
      return
    }
    const [y, m, d] = v.split('-').map(Number)
    endDateEpoch.value = toCivilDayEpoch(y!, m! - 1, d!)
  },
})

const amountNumber = computed(() => Number.parseFloat(amount.value))
const canSave = computed(() => Number.isFinite(amountNumber.value) && amountNumber.value > 0 && interval.value >= 1)

function onSave() {
  const prev = existing.value
  if (!prev || !canSave.value)
    return
  const values: RecurrenceItem = {
    ...prev,
    amount: amountNumber.value,
    autoCreate: autoCreate.value,
    endCount: endMode.value === 'count' ? endCount.value : null,
    endDate: endMode.value === 'date' ? endDateEpoch.value : null,
    endMode: endMode.value,
    freq: freq.value,
    interval: interval.value,
    monthLastDay: freq.value === 'month' ? monthLastDay.value : false,
    updatedAt: Date.now(),
  }
  recurrencesStore.saveRecurrence(values, props.recurrenceId)
  emit('closed')
}
</script>

<template>
  <BottomSheetModal @closed="emit('closed')">
    <UiTitleModal>
      {{ t('recurrences.editTitle') }}
    </UiTitleModal>

    <div class="bottomSheetContentInside grid gap-4 px-3 pb-6">
      <!-- Series context (read-only) -->
      <div class="bg-elevated/30 flex items-center gap-2 rounded-md px-3 py-2">
        <div
          class="flex size-7 shrink-0 items-center justify-center rounded-full"
          :style="{ background: category?.color ?? 'var(--ui-bg-accented)' }"
        >
          <Icon :name="category?.icon ?? 'lucide:repeat'" size="16" class="text-white" />
        </div>
        <div class="min-w-0">
          <div class="text-highlighted truncate text-sm">
            {{ category?.name ?? existing?.categoryId }}
          </div>
          <div class="text-2xs text-muted">
            {{ wallet?.name }}
          </div>
        </div>
      </div>

      <!-- Amount -->
      <div class="grid gap-1">
        <div class="text-2xs text-muted tracking-wide uppercase">
          {{ t('recurrences.form.amount') }}
        </div>
        <FormInput
          v-model="amount"
          :placeholder="t('recurrences.form.amount')"
          type="number"
        />
      </div>

      <!-- Frequency -->
      <div class="grid gap-1">
        <div class="text-2xs text-muted tracking-wide uppercase">
          {{ t('recurrences.form.repeat') }}
        </div>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="f in recurrenceFreqs"
            :key="f"
            type="button"
            class="grow rounded-md px-3 py-2 text-sm"
            :class="freq === f ? 'bg-primary/70 text-icon-primary' : 'bg-elevated/30 text-muted hover:bg-elevated/50'"
            @click="freq = f"
          >
            {{ t(`recurrences.freq.${f}`) }}
          </button>
        </div>
      </div>

      <!-- Interval -->
      <label class="text-muted flex items-center gap-2 text-sm">
        {{ t('recurrences.form.every') }}
        <input
          v-model.number="interval"
          type="number"
          min="1"
          class="bg-elevated/40 text-highlighted w-16 rounded-sm px-2 py-1 text-center"
        >
        {{ t(`recurrences.unit.${freq}`, interval) }}
      </label>

      <label v-if="freq === 'month'" class="text-muted flex items-center gap-2 text-sm">
        <input v-model="monthLastDay" type="checkbox" class="size-4">
        {{ t('recurrences.form.monthLastDay') }}
      </label>

      <label class="text-muted flex items-center gap-2 text-sm">
        <input v-model="autoCreate" type="checkbox" class="size-4">
        {{ t('recurrences.form.autoCreate') }}
      </label>

      <!-- End condition -->
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-muted text-sm">{{ t('recurrences.form.ends') }}</span>
        <select v-model="endMode" class="bg-elevated/40 text-highlighted rounded-sm px-2 py-1 text-sm">
          <option value="never">
            {{ t('recurrences.end.never') }}
          </option>
          <option value="date">
            {{ t('recurrences.end.date') }}
          </option>
          <option value="count">
            {{ t('recurrences.end.count') }}
          </option>
        </select>

        <input
          v-if="endMode === 'date'"
          v-model="endDateInput"
          type="date"
          class="bg-elevated/40 text-highlighted rounded-sm px-2 py-1 text-sm"
        >
        <input
          v-if="endMode === 'count'"
          v-model.number="endCount"
          type="number"
          min="1"
          class="bg-elevated/40 text-highlighted w-20 rounded-sm px-2 py-1 text-sm"
          :placeholder="t('recurrences.end.countPlaceholder')"
        >
      </div>

      <!-- Actions -->
      <div class="mt-2 flex items-center gap-2">
        <button
          type="button"
          class="bg-primary text-icon-primary grow rounded-md px-3 py-2 text-sm disabled:opacity-40"
          :disabled="!canSave"
          @click="onSave"
        >
          {{ t('recurrences.form.save') }}
        </button>
      </div>
    </div>
  </BottomSheetModal>
</template>
