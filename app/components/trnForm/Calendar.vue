<script setup lang="ts">
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const props = defineProps<{
  hide: () => void
}>()

const trnsFormStore = useTrnsFormStore()
const date = ref(new Date(trnsFormStore.values.date).toISOString())
const maxDate = new Date()

watch(date, (value) => {
  if (value) {
    trnsFormStore.values.date = new Date(+value).getTime()
    props.hide()
  }
})
</script>

<template>
  <DatePicker
    :value="date"
    :maxDate="maxDate"
    expanded
    mode="date"
    @update:modelValue="value => date = value"
  />
</template>
