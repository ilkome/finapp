import moment from 'moment'

const mixin = {
  methods: {
    formatDate(date, params) {
      if (params) {
        return moment(date).format(params)
      }
      return moment(date).format('D MMMM')
    }
  }
}

export default mixin
