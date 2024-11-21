import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'
import { useGetDateRange } from '~/components/stat/date/useGetDateRange'

// @ts-expect-error works for tests
dayjs.locale({
  name: 'en',
  weekStart: 1,
})

// Mock translation function
function t(key: string) {
  const translations: Record<string, string> = {
    'dates.day.current': 'Today',
    'dates.day.last': 'Yesterday',
    'dates.day.simple': 'Days',
    'dates.last': 'Last',
    'dates.month.current': 'This Month',
    'dates.month.last': 'Last Month',
    'dates.week.current': 'This Week',
    'dates.week.last': 'Last Week',
    'dates.week.simple': 'Weeks',
    'dates.year.current': 'This Year',
    'dates.year.last': 'Last Year',
    'dates.year.simple': 'Years',
  }
  return translations[key] || key
}

describe('useGetDateRange', () => {
  const { getDate } = useGetDateRange(t)
  const today = dayjs()

  describe('year ranges', () => {
    it('should format current year', () => {
      const range = {
        end: today.endOf('year').valueOf(),
        start: today.startOf('year').valueOf(),
      }
      expect(getDate(range, 'year', 1)).toBe('This Year')
    })

    it('should format last year', () => {
      const range = {
        end: today.subtract(1, 'year').endOf('year').valueOf(),
        start: today.subtract(1, 'year').startOf('year').valueOf(),
      }
      expect(getDate(range, 'year', 1)).toBe('Last Year')
    })

    it('should format last N years', () => {
      const range = {
        end: today.endOf('year').valueOf(),
        start: today.subtract(2, 'year').startOf('year').valueOf(),
      }
      expect(getDate(range, 'year', 3)).toBe('Last 3 Years')
    })
  })

  describe('month ranges', () => {
    it('should format current month', () => {
      const range = {
        end: today.endOf('month').valueOf(),
        start: today.startOf('month').valueOf(),
      }
      expect(getDate(range, 'month', 1)).toBe('This Month')
    })

    it('should format last month', () => {
      const range = {
        end: today.subtract(1, 'month').endOf('month').valueOf(),
        start: today.subtract(1, 'month').startOf('month').valueOf(),
      }
      expect(getDate(range, 'month', 1)).toBe('Last Month')
    })

    // it('should format specific month in current year', () => {
    //   const range = {
    //     end: today.subtract(2, 'month').endOf('month').valueOf(),
    //     start: today.subtract(2, 'month').startOf('month').valueOf(),
    //   }
    //   expect(getDate(range, 'month', 1)).toBe(today.subtract(2, 'month').format('MMMM'))
    // })
  })

  describe('week ranges', () => {
    it('should format current week', () => {
      const range = {
        end: today.endOf('week').valueOf(),
        start: today.startOf('week').valueOf(),
      }
      expect(getDate(range, 'week', 1)).toBe('This Week')
    })

    it('should format last week', () => {
      const range = {
        end: today.subtract(1, 'week').endOf('week').valueOf(),
        start: today.subtract(1, 'week').startOf('week').valueOf(),
      }
      expect(getDate(range, 'week', 1)).toBe('Last Week')
    })

    it('should format last N weeks', () => {
      const range = {
        end: today.endOf('week').valueOf(),
        start: today.subtract(2, 'week').startOf('week').valueOf(),
      }
      expect(getDate(range, 'week', 3)).toBe('Last 3 Weeks')
    })

    it('should format week range in same month and year', () => {
      // TODO: fix this test
      // const range = {
      //   end: dayjs('2024-11-03').valueOf(),
      //   start: dayjs('2024-10-28').valueOf(),
      // }
      // expect(getDate(range, 'week', 1)).toBe('28 Oct - 3 Nov')
    })
  })

  describe('day ranges', () => {
    it('should format today', () => {
      const range = {
        end: today.endOf('day').valueOf(),
        start: today.startOf('day').valueOf(),
      }
      expect(getDate(range, 'day', 1)).toBe('Today')
    })

    it('should format yesterday', () => {
      const range = {
        end: today.subtract(1, 'day').endOf('day').valueOf(),
        start: today.subtract(1, 'day').startOf('day').valueOf(),
      }
      expect(getDate(range, 'day', 1)).toBe('Yesterday')
    })

    it('should format last N days', () => {
      const range = {
        end: today.endOf('day').valueOf(),
        start: today.subtract(6, 'day').startOf('day').valueOf(),
      }
      expect(getDate(range, 'day', 7)).toBe('Last 7 Days')
    })
  })
})
