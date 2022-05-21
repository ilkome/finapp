export const state = () => ({
  isShowDataLabels: true,

  periods: {
    day: {
      groupedBy: 'month',
      showedPeriods: 31,
      grouped: false,
    },
    week: {
      groupedBy: 'month',
      showedPeriods: 12,
      grouped: false,
    },
    month: {
      groupedBy: 'year',
      showedPeriods: 12,
      grouped: false,
    },
    year: {
      groupedBy: 'year',
      showedPeriods: 6,
      grouped: false,
    },
  },
})
