import { describe, expect, it } from 'vitest'
import { endOfDay, endOfMonth, endOfWeek, endOfYear, startOfDay, startOfMonth, startOfWeek, startOfYear, subDays, subMonths, subWeeks, subYears } from 'date-fns'
import { useGetDateRange } from '~/components/stat/date/useGetDateRange'

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
  const { getStringDateRange } = useGetDateRange(t)
  const today = new Date()

  describe('year ranges', () => {
    it('should format current year', () => {
      const range = {
        end: endOfYear(today).getTime(),
        start: startOfYear(today).getTime(),
      }
      expect(getStringDateRange(range, 'year', 1)).toBe('This Year')
    })

    it('should format last year', () => {
      const lastYear = subYears(today, 1)
      const range = {
        end: endOfYear(lastYear).getTime(),
        start: startOfYear(lastYear).getTime(),
      }
      expect(getStringDateRange(range, 'year', 1)).toBe('Last Year')
    })

    it('should format last N years', () => {
      const range = {
        end: endOfYear(today).getTime(),
        start: startOfYear(subYears(today, 2)).getTime(),
      }
      expect(getStringDateRange(range, 'year', 3)).toBe('Last 3 Years')
    })
  })

  describe('month ranges', () => {
    it('should format current month', () => {
      const range = {
        end: endOfMonth(today).getTime(),
        start: startOfMonth(today).getTime(),
      }
      expect(getStringDateRange(range, 'month', 1)).toBe('This Month')
    })

    it('should format last month', () => {
      const lastMonth = subMonths(today, 1)
      const range = {
        end: endOfMonth(lastMonth).getTime(),
        start: startOfMonth(lastMonth).getTime(),
      }
      expect(getStringDateRange(range, 'month', 1)).toBe('Last Month')
    })
  })

  describe('week ranges', () => {
    it('should format current week', () => {
      const range = {
        end: endOfWeek(today, { weekStartsOn: 1 }).getTime(),
        start: startOfWeek(today, { weekStartsOn: 1 }).getTime(),
      }
      expect(getStringDateRange(range, 'week', 1)).toBe('This Week')
    })

    it('should format last week', () => {
      const lastWeek = subWeeks(today, 1)
      const range = {
        end: endOfWeek(lastWeek, { weekStartsOn: 1 }).getTime(),
        start: startOfWeek(lastWeek, { weekStartsOn: 1 }).getTime(),
      }
      expect(getStringDateRange(range, 'week', 1)).toBe('Last Week')
    })

    it('should format last N weeks', () => {
      const range = {
        end: endOfWeek(today, { weekStartsOn: 1 }).getTime(),
        start: startOfWeek(subWeeks(today, 2), { weekStartsOn: 1 }).getTime(),
      }
      expect(getStringDateRange(range, 'week', 3)).toBe('Last 3 Weeks')
    })

    it('should format week range in same month and year', () => {
      const range = {
        end: endOfWeek(new Date('2024-11-03'), { weekStartsOn: 1 }).getTime(),
        start: startOfWeek(new Date('2024-10-14'), { weekStartsOn: 1 }).getTime(),
      }
      expect(getStringDateRange(range, 'week', 1)).toBe('14 October - 3 November')
    })
  })

  describe('day ranges', () => {
    it('should format today', () => {
      const range = {
        end: endOfDay(today).getTime(),
        start: startOfDay(today).getTime(),
      }
      expect(getStringDateRange(range, 'day', 1)).toBe('Today')
    })

    it('should format yesterday', () => {
      const lastDay = subDays(today, 1)
      const range = {
        end: endOfDay(lastDay).getTime(),
        start: startOfDay(lastDay).getTime(),
      }
      expect(getStringDateRange(range, 'day', 1)).toBe('Yesterday')
    })

    it('should format last N days', () => {
      const range = {
        end: endOfDay(today).getTime(),
        start: startOfDay(subDays(today, 6)).getTime(),
      }
      expect(getStringDateRange(range, 'day', 7)).toBe('Last 7 Days')
    })
  })
})
