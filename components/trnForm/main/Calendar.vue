<script setup lang="ts">
import dayjs from 'dayjs'
import { DatePicker } from 'v-calendar'
import 'v-calendar/style.css'
import '~/components/modal/styles/modalLinks.styl'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const props = defineProps<{
  hide: () => void
}>()

const colorMode = useColorMode()
const $trnForm = useTrnFormStore()

const isDark = computed(() => colorMode.preference === 'dark' || colorMode.preference === 'system')
const date = ref(dayjs($trnForm.values.date).toString())
const maxDate = new Date()

watch(date, (value) => {
  $trnForm.values.date = dayjs(value).valueOf()
  props.hide()
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
