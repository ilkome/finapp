<script setup lang="ts">
import 'v-calendar/style.css'
import dayjs from 'dayjs'
import { DatePicker } from 'v-calendar'
import { useFilterStore } from '~/components/filter/useFilterStore'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const props = defineProps<{
  hide: () => void
}>()

const colorMode = useColorMode()
const $trnForm = useTrnFormStore()
const filterStore = useFilterStore()

const isDark = computed(() => colorMode.preference === 'dark' || colorMode.preference === 'system')
const date = ref(dayjs($trnForm.values.date).toString())
const maxDate = new Date()

watch(date, (value) => {
  const newDate = dayjs(value).valueOf()
  $trnForm.values.date = dayjs(value).valueOf()
  props.hide()

  if (filterStore.periodNameWithoutAll === 'day')
    filterStore.setDate(newDate)
})
</script>

<template>
  <DatePicker
    v-model="date"
    :isDark="isDark"
    :maxDate="maxDate"
    borderless
    expanded
    mode="date"
    transparent
  />
</template>
