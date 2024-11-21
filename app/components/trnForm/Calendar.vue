<script setup lang="ts">
import 'v-calendar/style.css'
import dayjs from 'dayjs'
import { DatePicker } from 'v-calendar'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const props = defineProps<{
  hide: () => void
}>()

const colorMode = useColorMode()
const trnsFormStore = useTrnsFormStore()

const isDark = computed(() => colorMode.preference === 'dark' || colorMode.preference === 'system')
const date = ref(dayjs(trnsFormStore.values.date).toString())
const maxDate = new Date()

watch(date, (value) => {
  if (value) {
    trnsFormStore.values.date = dayjs(value).valueOf()
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
