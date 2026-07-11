<script setup lang="ts">
/*
 * UCalendar has bad type definitions
 */
import type { CalendarDate } from '@internationalized/date'

import { formatByLocale, getUCalendarCivilDate, parseUCalendarDate } from '~/components/date/utils'

const props = defineProps<{
  clearable?: boolean
  modelValue: number | null
  placeholder?: string
  title?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const { locale, t } = useI18n()
const dateLocale = computed(() => locale.value.startsWith('ru') ? 'ru' : 'en')
const isOpen = ref(false)

const calendarDate = computed(() => props.modelValue != null ? parseUCalendarDate(props.modelValue) : undefined)
const label = computed(() => props.modelValue != null
  ? formatByLocale(props.modelValue, 'd MMM yyyy', dateLocale.value)
  : (props.placeholder ?? t('base.selectDate')))

function onClear(close: () => void) {
  emit('update:modelValue', null)
  close()
}

function onPick(date: CalendarDate | undefined, close: () => void) {
  if (!date)
    return
  emit('update:modelValue', getUCalendarCivilDate(date))
  close()
}
</script>

<template>
  <BottomSheetOrDropdown
    :title="props.title ?? t('common.date')"
    :isOpen="isOpen"
    isShowCloseBtn
    @openModal="isOpen = true"
    @closeModal="isOpen = false"
  >
    <template #trigger>
      <button
        type="button"
        class="bg-elevated/30 hover:bg-elevated/50 focus:bg-elevated/50 focus:border-primary m-0 flex min-h-[42px] w-full items-center gap-2 rounded-md border border-transparent px-4 py-2 text-left text-base font-normal outline-none"
      >
        <span :class="props.modelValue != null ? 'text-highlighted' : 'text-muted'">
          {{ label }}
        </span>
        <Icon name="lucide:calendar" size="16" class="text-muted ml-auto shrink-0" />
      </button>
    </template>

    <template #content="{ close }">
      <div class="min-w-80">
        <!-- @vue-ignore -->
        <UCalendar
          :modelValue="calendarDate"
          class="p-3"
          @update:modelValue="(d: CalendarDate) => onPick(d, close)"
        />
        <div v-if="props.clearable && props.modelValue != null" class="flex justify-end px-3 pb-3">
          <button
            type="button"
            class="text-muted hover:text-highlighted text-sm"
            @click="onClear(close)"
          >
            {{ t('base.clear') }}
          </button>
        </div>
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
