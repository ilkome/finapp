<script>
import moment from 'moment'

import Datepicker from 'vuejs-datepicker'
import ModalButton from '@/components/modal/ModalButton'
import TrnFormModal from '@/components/trnForm/TrnFormModal'

const calendarOptions = {
  'use-utc': true,
  disabledDates: {
    from: new Date()
  }
}

export default {
  components: {
    Datepicker,
    ModalButton,
    TrnFormModal
  },

  computed: {
    date () {
      return this.$store.state.trnForm.values.date
    }
  },

  created () {
    this.calendarOptions = calendarOptions
  },

  methods: {
    handleSelectDate (date) {
      this.$store.commit('setTrnFormValues', {
        date: moment(date).valueOf()
      })
      this.$store.commit('toogleTrnFormModal', 'calendar')
    },
    handleSelectDateDaysAgo (daysAgo) {
      this.$store.commit('setTrnFormValues', {
        date: moment().subtract(daysAgo, 'day').valueOf()
      })
      this.$store.commit('toogleTrnFormModal', 'calendar')
    }
  }
}
</script>

<template lang="pug">
TrnFormModal(
  :show="$store.state.trnForm.modal.calendar"
  title="Date"
  v-on:onClose="$store.commit('toogleTrnFormModal', 'calendar')"
)
  Datepicker(
    :inline="true"
    :value="date"
    :monday-first="true"
    wrapper-class="inlineCalendar"
    calendar-class="inlineCalendar__in"
    :disabledDates="calendarOptions.disabledDates"
    @selected="handleSelectDate"
  )
  .modalLinks
    ModalButton(
      name="2 days ago"
      icon="mdi mdi-calendar-clock"
      v-on:onClick="() => handleSelectDateDaysAgo(2)"
    )
    ModalButton(
      name="Yesterday"
      icon="mdi mdi-weather-night"
      v-on:onClick="() => handleSelectDateDaysAgo(1)"
    )
    ModalButton(
      name="Today"
      icon="mdi mdi-weather-sunset-up"
      v-on:onClick="() => handleSelectDateDaysAgo(0)"
    )
</template>
