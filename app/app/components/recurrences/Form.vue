<script setup lang="ts">
import { formatByLocale, todayCivilDayEpoch } from '~~/utils/date/civil'

import type { CategoryId } from '~/components/categories/types'
import type { RecurrenceId, RecurrenceItem, RecurrenceSchedule } from '~/components/recurrences/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { nextOccurrence, priceHistoryTimeline } from '~/components/recurrences/occurrences'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { TrnType } from '~/components/trns/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  recurrenceId: RecurrenceId
}>()

const emit = defineEmits<{
  closed: []
}>()

const { locale, t } = useI18n()
const recurrencesStore = useRecurrencesStore()
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()

const dateLocale = computed(() => locale.value.startsWith('ru') ? 'ru' : 'en')

const existing = computed(() => recurrencesStore.items?.[props.recurrenceId])
const typeLabel = computed(() => existing.value?.type === TrnType.Income ? t('money.income') : t('money.expense'))

// Category and wallet are editable; the edit only steers FUTURE occurrences (buildOccurrenceTrn
// reads them at generation time, and the occurrence trn id excludes them), so already-created trns
// keep their old category/wallet. Type stays fixed - flipping it would reinterpret history/stats.
const categoryId = ref<CategoryId>(existing.value?.categoryId ?? '')
const walletId = ref<WalletId>(existing.value?.walletId ?? '')
const isPickingCategory = ref(false)
const isPickingWallet = ref(false)

const category = computed(() => categoriesStore.items?.[categoryId.value])
const wallet = computed(() => walletsStore.items?.[walletId.value])

// Switching to a wallet in another currency reinterprets amounts (no conversion), so warn the user.
const originalCurrency = existing.value ? walletsStore.items?.[existing.value.walletId]?.currency : undefined
const currencyChanged = computed(() => !!wallet.value?.currency && !!originalCurrency && wallet.value.currency !== originalCurrency)

function onSelectCategory(id: CategoryId) {
  categoryId.value = id
  isPickingCategory.value = false
}

function onSelectWallet(id: WalletId) {
  walletId.value = id
  isPickingWallet.value = false
}

// Editable schedule fields (type stays fixed - it defines the series identity).
const amount = ref<string>(existing.value ? String(existing.value.amount) : '')
const schedule = reactive<RecurrenceSchedule>({
  autoCreate: existing.value?.autoCreate ?? true,
  endCount: existing.value?.endCount ?? null,
  endDate: existing.value?.endDate ?? null,
  endMode: existing.value?.endMode ?? 'never',
  freq: existing.value?.freq ?? 'month',
  interval: existing.value?.interval ?? 1,
  monthLastDay: existing.value?.monthLastDay ?? false,
})

const amountNumber = computed(() => Number.parseFloat(amount.value))
const canSave = computed(() => Number.isFinite(amountNumber.value) && amountNumber.value > 0 && schedule.interval >= 1 && !!categoryId.value && !!walletId.value)

// Price change: a new amount takes effect from a chosen day (default today), recorded in history.
const amountChanged = computed(() => existing.value != null && amountNumber.value !== existing.value.amount)
const effectiveFromEpoch = ref<number>(todayCivilDayEpoch())
const effectiveFrom = computed({
  get: (): number | null => effectiveFromEpoch.value,
  set: (v: number | null) => {
    if (v != null)
      effectiveFromEpoch.value = v
  },
})

// Change the next charge date (re-anchors the cadence from there). Empty = keep current schedule.
const rescheduleEpoch = ref<number | null>(null)

const nextChargeLabel = computed(() => {
  if (!existing.value)
    return ''
  const next = nextOccurrence(existing.value, todayCivilDayEpoch())
  return next != null ? formatByLocale(next, 'd MMM yyyy', dateLocale.value) : t('recurrences.form.noNext')
})

// Show the timeline only once there is more than the single seeded (current) price.
const hasPriceHistory = computed(() => !!existing.value && priceHistoryTimeline(existing.value).length > 1)

// Correct a mistaken effective-from date on an existing price change (identified by its `from`).
const editingFrom = ref<number | null>(null)
const editingDate = ref<number | null>(null)

function onEditPriceDate(from: number) {
  editingFrom.value = from
  editingDate.value = from
}
function onSaveEditedDate(close: () => void) {
  const history = existing.value?.amountHistory
  if (history && editingFrom.value != null && editingDate.value != null) {
    const from = editingFrom.value
    const to = editingDate.value
    recurrencesStore.setAmountHistory(
      props.recurrenceId,
      history.map(e => e.from === from ? { ...e, from: to } : e),
    )
  }
  editingFrom.value = null
  close()
}
function onRemovePrice(from: number) {
  const history = existing.value?.amountHistory
  if (history)
    recurrencesStore.setAmountHistory(props.recurrenceId, history.filter(e => e.from !== from))
}

function onSave(close: () => void) {
  const prev = existing.value
  if (!prev || !canSave.value)
    return
  // Schedule/options/end conditions (amount and price history are handled separately below).
  const values: RecurrenceItem = {
    ...prev,
    autoCreate: schedule.autoCreate,
    categoryId: categoryId.value,
    endCount: schedule.endMode === 'count' ? schedule.endCount : null,
    endDate: schedule.endMode === 'date' ? schedule.endDate : null,
    endMode: schedule.endMode,
    freq: schedule.freq,
    interval: schedule.interval,
    monthLastDay: schedule.freq === 'month' ? schedule.monthLastDay : false,
    updatedAt: Date.now(),
    walletId: walletId.value,
  }
  recurrencesStore.saveRecurrence(values, props.recurrenceId)
  if (amountChanged.value)
    recurrencesStore.changeAmount(props.recurrenceId, amountNumber.value, effectiveFromEpoch.value)
  if (rescheduleEpoch.value != null)
    recurrencesStore.rescheduleFrom(props.recurrenceId, rescheduleEpoch.value)
  close()
}
</script>

<template>
  <BottomSheetModal @closed="emit('closed')">
    <template #default="{ close }">
      <UiTitleModal>
        {{ t('recurrences.editTitle') }}
      </UiTitleModal>

      <div class="bottomSheetContentInside grid scrollerBlock content-start gap-5 px-3 py-2">
        <!-- Category (editable: steers future occurrences only) -->
        <FormElement>
          <template #label>
            {{ t('recurrences.form.category') }}
          </template>
          <UiButtonWithRight @click="isPickingCategory = true">
            <template #value>
              <span
                v-if="category"
                class="flex size-5 shrink-0 items-center justify-center rounded-full"
                :style="{ background: category.color ?? 'var(--ui-bg-accented)' }"
              >
                <Icon :name="category.icon ?? 'lucide:folder'" size="12" class="text-white" />
              </span>
              <span :class="category ? 'text-highlighted' : 'text-muted'">
                {{ category?.name ?? t('recurrences.form.selectCategory') }}
              </span>
            </template>
          </UiButtonWithRight>
        </FormElement>

        <!-- Wallet (editable: steers future occurrences only) -->
        <FormElement>
          <template #label>
            {{ t('recurrences.form.wallet') }}
          </template>
          <UiButtonWithRight @click="isPickingWallet = true">
            <template #value>
              <span :class="wallet ? 'text-highlighted' : 'text-muted'">
                {{ wallet?.name ?? t('recurrences.form.selectWallet') }}
              </span>
              <span v-if="wallet?.currency" class="text-2xs text-muted">{{ wallet.currency }}</span>
            </template>
          </UiButtonWithRight>
          <div class="grid gap-1 px-1 pt-1">
            <div class="flex items-center gap-1 text-2xs text-muted">
              <Icon name="lucide:lock" size="12" />
              {{ typeLabel }} · {{ t('recurrences.form.lockedHint') }}
            </div>
            <div class="flex items-center gap-1 text-2xs text-muted">
              <Icon name="lucide:info" size="12" />
              {{ t('recurrences.form.editKeepsHint') }}
            </div>
            <div v-if="currencyChanged" class="flex items-center gap-1 text-2xs text-warning">
              <Icon name="lucide:triangle-alert" size="12" />
              {{ t('recurrences.form.currencyChangeHint', { currency: wallet?.currency }) }}
            </div>
          </div>
        </FormElement>

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
          <!-- When the price changes, record from which day it applies (default today). -->
          <div v-if="amountChanged" class="mt-2 grid gap-1">
            <div class="text-2xs text-muted">
              {{ t('recurrences.form.effectiveFrom') }}
            </div>
            <FormDate v-model="effectiveFrom" />
          </div>
        </FormElement>

        <!-- Price history -->
        <FormElement v-if="hasPriceHistory && existing">
          <template #label>
            {{ t('recurrences.form.priceHistory') }}
          </template>
          <RecurrencesPriceTimeline
            :currency="wallet?.currency ?? 'USD'"
            editable
            :rule="existing"
            :type="existing.type"
            @edit="onEditPriceDate"
            @remove="onRemovePrice"
          />
        </FormElement>

        <!-- Next charge date (re-anchors the cadence from a chosen day) -->
        <FormElement>
          <template #label>
            {{ t('recurrences.form.nextCharge') }}
          </template>
          <div class="grid gap-1">
            <FormDate v-model="rescheduleEpoch" clearable />
            <span class="text-2xs text-muted">{{ t('recurrences.form.currentNext') }} {{ nextChargeLabel }}</span>
          </div>
        </FormElement>

        <!-- Schedule (frequency / interval / options / end condition) -->
        <RecurrencesScheduleEditor v-model="schedule" />
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

      <BottomSheetModal
        v-if="isPickingCategory"
        @closed="isPickingCategory = false"
      >
        <div class="bottomSheetContentInside h-[70vh] scrollerBlock">
          <CategoriesSelectorModal
            :activeItemId="categoryId"
            @selected="onSelectCategory"
          />
        </div>
      </BottomSheetModal>

      <BottomSheetModal
        v-if="isPickingWallet"
        @closed="isPickingWallet = false"
      >
        <div class="bottomSheetContentInside h-[70vh] scrollerBlock">
          <WalletsSelector
            :activeItemId="walletId"
            withHeader
            class="px-2"
            @selected="onSelectWallet"
          />
        </div>
      </BottomSheetModal>

      <BottomSheetModal
        v-if="editingFrom != null"
        @closed="editingFrom = null"
      >
        <template #default="{ close: closeEdit }">
          <UiTitleModal>
            {{ t('recurrences.form.editPriceDate') }}
          </UiTitleModal>
          <div class="bottomSheetContentInside grid content-start gap-3 px-3 py-2">
            <div class="text-2xs text-muted">
              {{ t('recurrences.form.effectiveFrom') }}
            </div>
            <FormDate v-model="editingDate" />
          </div>
          <div class="bottomSheetContentBottom">
            <UiButtonAccent
              class="sm:max-w-xs"
              rounded
              :disabled="editingDate == null"
              @click="onSaveEditedDate(closeEdit)"
            >
              {{ t('base.save') }}
            </UiButtonAccent>
          </div>
        </template>
      </BottomSheetModal>
    </template>
  </BottomSheetModal>
</template>
