<script>
import { formatDate } from '@/utils/formatDate'
import TrnItem from '@/components/trns/item/TrnItem'

export default {
  components: { TrnItem },

  props: {
    date: {
      type: String,
      required: true
    }
  },

  computed: {
    formatedDate () {
      return formatDate(this.date, 'full')
    }
  }
}
</script>

<template lang="pug">
.trnsListDate
  .trnsListDate__day {{ formatedDate.day }}
  .trnsListDate__weekDay {{ formatedDate.weekDay }}
  .trnsListDate__other
    .trnsListDate__month {{ formatedDate.month }}
    .trnsListDate__year {{ formatedDate.year }}
</template>
