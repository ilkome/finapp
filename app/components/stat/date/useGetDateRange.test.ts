import { addMonths, endOfDay, endOfMonth, endOfWeek, endOfYear, startOfDay, startOfMonth, startOfWeek, startOfYear, subDays, subMonths, subWeeks, subYears } from 'date-fns'
import { describe, expect, it } from 'vitest'

import { useGetDateRange } from '~/components/stat/date/useGetDateRange'

// Mock translation function
function t(key: string) {
  const translations: Record<string, string> = {
    'dates.day.current': 'Today',
    'dates.day.last': 'Yesterday',
    'dates.day.simple': 'Days',
    'dates.last.simple': 'Last',
    'dates.month.current': 'This Month',
    'dates.month.last': 'Last Month',
    'dates.month.simple': 'Months',
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
      expect(getStringDateRange(range, 'year', 3)).toBe('dates.last.year 3 dates.year.plural')
    })

    it('should format year range', () => {
      const range = {
        end: endOfYear(new Date('2023-12-31')).getTime(),
        start: startOfYear(new Date('2021-01-01')).getTime(),
      }
      expect(getStringDateRange(range, 'year', 2)).toBe('2021 - 2023')
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

    it('should format last N months', () => {
      const range = {
        end: endOfMonth(today).getTime(),
        start: startOfMonth(subMonths(today, 2)).getTime(),
      }
      expect(getStringDateRange(range, 'month', 3)).toBe('dates.last.month 3 dates.month.plural')
    })

    it('should format month range in this year', () => {
      const range = {
        end: addMonths(startOfYear(today), 2).getTime(),
        start: addMonths(startOfYear(today), 1).getTime(),
      }
      expect(getStringDateRange(range, 'month', 2)).toBe('Feb - Mar')
    })

    it('should format month range across years', () => {
      const range = {
        end: endOfMonth(new Date('2024-02-29')).getTime(),
        start: startOfMonth(new Date('2023-11-01')).getTime(),
      }
      expect(getStringDateRange(range, 'month', 1)).toBe('Nov 2023 - Feb 2024')
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
      expect(getStringDateRange(range, 'week', 3)).toBe('dates.last.week 3 dates.week.plural')
    })

    it('should format week range in same month and year', () => {
      const range = {
        end: endOfWeek(new Date('2024-11-03'), { weekStartsOn: 1 }).getTime(),
        start: startOfWeek(new Date('2024-10-14'), { weekStartsOn: 1 }).getTime(),
      }
      expect(getStringDateRange(range, 'week', 1)).toBe('14 Oct - 3 Nov 2024')
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
      expect(getStringDateRange(range, 'day', 7)).toBe('dates.last.day 7 dates.day.plural')
    })

    it('should format day range in same month', () => {
      const range = {
        end: endOfDay(new Date('2024-03-15')).getTime(),
        start: startOfDay(new Date('2024-03-10')).getTime(),
      }
      expect(getStringDateRange(range, 'day', 5)).toBe('10-15 Mar 2024')
    })
  })
})
