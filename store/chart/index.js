export const state = () => ({
  hoveredPeriod: {
    values: null,
    position: null
  },

  periods: {
    day: {
      groupedBy: 'month',
      showedGroups: 14,
      showedPeriods: 14,
      grouped: false
    },
    week: {
      groupedBy: 'month',
      showedGroups: 6,
      showedPeriods: 6,
      grouped: false
    },
    month: {
      groupedBy: 'year',
      showedGroups: 6,
      showedPeriods: 6,
      grouped: false
    },
    year: {
      groupedBy: 'year',
      showedGroups: 3,
      showedPeriods: 3,
      grouped: false
    }
  }
})
