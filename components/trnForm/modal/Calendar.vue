<script setup lang="ts">
import dayjs from 'dayjs'
import { DatePicker } from 'v-calendar'
import 'v-calendar/style.css'
import '~/components/modal/styles/modalLinks.styl'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const colorMode = useColorMode()
const $trnForm = useTrnFormStore()

function handleSelectDateDaysAgo(daysAgo: number, close: () => void) {
  $trnForm.values.date = dayjs().subtract(daysAgo, 'day').valueOf()
  close()
}

function afterClose() {
  $trnForm.closeTrnFormModal('calendar')
}

const isDark = computed(() => colorMode.preference === 'dark' || colorMode.preference === 'system')
const date = ref(dayjs($trnForm.values.date).toString())
const maxDate = new Date()

watch(date, (value) => {
  $trnForm.values.date = dayjs(value).valueOf()
  $trnForm.modal.calendar = false
})
</script>

<template>
  <TrnFormModal @closed="afterClose">
    <template #header>
      {{ $t('common.date') }}
    </template>

    <template #default="{ close }">
      <DatePicker
        v-model="date"
        :isDark="isDark"
        :maxDate="maxDate"
        borderless
        expanded
        mode="date"
        transparent
      />

      <div class="modalLinks">
        <ModalButton
          :name="$t('dates.twoDaysAgo')"
          icon="mdi mdi-calendar-clock"
          @onClick="() => handleSelectDateDaysAgo(2, close)"
        />
        <ModalButton
          :name="$t('dates.day.yesterday')"
          icon="mdi mdi-weather-night"
          @onClick="() => handleSelectDateDaysAgo(1, close)"
        />
        <ModalButton
          :name="$t('dates.day.today')"
          icon="mdi mdi-calendar-today"
          @onClick="() => handleSelectDateDaysAgo(0, close)"
        />
      </div>
    </template>
  </TrnFormModal>
</template>

<style lang="stylus">
.vc-container
  //
</style>
