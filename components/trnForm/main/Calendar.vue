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
const trnFormStore = useTrnFormStore()
const filterStore = useFilterStore()

const isDark = computed(() => colorMode.preference === 'dark' || colorMode.preference === 'system')
const date = ref(dayjs(trnFormStore.values.date).toString())
const maxDate = new Date()

watch(date, (value) => {
  if (value) {
    trnFormStore.values.date = dayjs(value).valueOf()
    props.hide()
  }
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
