import { addMonths, endOfDay, endOfMonth, endOfWeek, endOfYear, startOfDay, startOfMonth, startOfWeek, startOfYear } from 'date-fns'
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
      expect(getStringDateRange(range, 'year', 1)).toBe(today.getFullYear().toString())
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
    it('should format week range in same month and year', () => {
      const range = {
        end: endOfWeek(new Date('2024-11-03'), { weekStartsOn: 1 }).getTime(),
        start: startOfWeek(new Date('2024-10-14'), { weekStartsOn: 1 }).getTime(),
      }
      expect(getStringDateRange(range, 'week', 1)).toBe('14 Oct - 3 Nov 2024')
    })
  })

  describe('day ranges', () => {
    it('should format day range in same month', () => {
      const range = {
        end: endOfDay(new Date('2024-03-15')).getTime(),
        start: startOfDay(new Date('2024-03-10')).getTime(),
      }
      expect(getStringDateRange(range, 'day', 5)).toBe('10-15 Mar 2024')
    })
  })
})
