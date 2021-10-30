export const state = () => ({
  isShowDataLabels: true,

  periods: {
    day: {
      groupedBy: 'month',
      showedPeriods: 14,
      grouped: false
    },
    week: {
      groupedBy: 'month',
      showedPeriods: 6,
      grouped: false
    },
    month: {
      groupedBy: 'year',
      showedPeriods: 6,
      grouped: false
    },
    year: {
      groupedBy: 'year',
      showedPeriods: 3,
      grouped: false
    }
  }
})
