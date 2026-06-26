<script setup lang="ts">
import type { RecurrenceEndMode, RecurrenceFreq, RecurrenceId, RecurrenceItem } from '~/components/recurrences/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { civilDayKey, toCivilDayEpoch } from '~/components/date/utils'
import { recurrenceFreqs } from '~/components/recurrences/types'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { TrnType } from '~/components/trns/types'
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
const typeLabel = computed(() => existing.value?.type === TrnType.Income ? t('money.income') : t('money.expense'))

// Editable schedule fields (category/wallet/type stay fixed - they define the series identity).
const amount = ref<string>(existing.value ? String(existing.value.amount) : '')
const freq = ref<RecurrenceFreq>(existing.value?.freq ?? 'month')
const interval = ref<number>(existing.value?.interval ?? 1)
const monthLastDay = ref<boolean>(existing.value?.monthLastDay ?? false)
const autoCreate = ref<boolean>(existing.value?.autoCreate ?? true)
const endMode = ref<RecurrenceEndMode>(existing.value?.endMode ?? 'never')
const endCount = ref<number | null>(existing.value?.endCount ?? null)
const endDateEpoch = ref<number | null>(existing.value?.endDate ?? null)

const endModeOptions = computed(() => [
  { label: t('recurrences.end.never'), value: 'never' },
  { label: t('recurrences.end.date'), value: 'date' },
  { label: t('recurrences.end.count'), value: 'count' },
])

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

function onSave(close: () => void) {
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
  close()
}
</script>

<template>
  <BottomSheetModal @closed="emit('closed')">
    <template #default="{ close }">
      <UiTitleModal>
        {{ t('recurrences.editTitle') }}
      </UiTitleModal>

      <div class="bottomSheetContentInside scrollerBlock grid content-start gap-5 px-3 py-2">
        <!-- Series context (read-only: category/wallet/type define the series identity). -->
        <div class="grid gap-1">
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
              <div class="text-2xs text-muted truncate">
                {{ wallet?.name }} · {{ typeLabel }}<template v-if="wallet?.currency">
                  · {{ wallet.currency }}
                </template>
              </div>
            </div>
          </div>
          <div class="text-2xs text-muted flex items-center gap-1 px-1">
            <Icon name="lucide:lock" size="12" />
            {{ t('recurrences.form.lockedHint') }}
          </div>
        </div>

        <!-- Amount -->
        <FormElement>
          <template #label>
            {{ t('recurrences.form.amount') }}
          </template>
          <FormInput
            v-model="amount"
            :placeholder="t('recurrences.form.amount')"
            type="number"
          />
        </FormElement>

        <!-- Frequency -->
        <FormElement>
          <template #label>
            {{ t('recurrences.form.repeat') }}
          </template>
          <UiTabsBar>
            <UiTabsItemPill
              v-for="f in recurrenceFreqs"
              :key="f"
              :isActive="freq === f"
              @click="freq = f"
            >
              {{ t(`recurrences.freq.${f}`) }}
            </UiTabsItemPill>
          </UiTabsBar>
        </FormElement>

        <!-- Interval -->
        <FormElement>
          <template #label>
            {{ t('recurrences.form.every') }}
          </template>
          <div class="flex items-center gap-2">
            <UiNumberStepper
              :modelValue="interval"
              :min="1"
              @update:modelValue="interval = $event"
            />
            <span class="text-muted text-sm">{{ t(`recurrences.unit.${freq}`, interval) }}</span>
          </div>
        </FormElement>

        <!-- Options -->
        <div class="grid gap-1">
          <UiSwitchItem
            v-if="freq === 'month'"
            :checkboxValue="monthLastDay"
            :title="t('recurrences.form.monthLastDay')"
            @click="monthLastDay = !monthLastDay"
          />
          <UiSwitchItem
            :checkboxValue="autoCreate"
            :title="t('recurrences.form.autoCreate')"
            @click="autoCreate = !autoCreate"
          />
        </div>

        <!-- End condition -->
        <FormElement>
          <template #label>
            {{ t('recurrences.form.ends') }}
          </template>
          <FormSelect
            :options="endModeOptions"
            :value="endMode"
            @change="(v: string) => endMode = v as RecurrenceEndMode"
          />
          <input
            v-if="endMode === 'date'"
            v-model="endDateInput"
            type="date"
            class="bg-elevated/40 text-highlighted mt-2 rounded-sm px-3 py-2 text-sm"
          >
          <div v-if="endMode === 'count'" class="mt-2 flex items-center gap-2">
            <UiNumberStepper
              :modelValue="endCount ?? 1"
              :min="1"
              @update:modelValue="endCount = $event"
            />
            <span class="text-muted text-sm">{{ t('recurrences.end.countPlaceholder') }}</span>
          </div>
        </FormElement>
      </div>

      <!-- Pinned footer (lives in the sheet's auto row, never scrolls away) -->
      <div class="bottomSheetContentBottom">
        <UiButtonAccent
          class="sm:max-w-xs"
          rounded
          :disabled="!canSave"
          @click="onSave(close)"
        >
          {{ t('base.save') }}
        </UiButtonAccent>
      </div>
    </template>
  </BottomSheetModal>
</template>
