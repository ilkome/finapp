import { addMonths, endOfDay, endOfMonth, endOfWeek, endOfYear, startOfDay, startOfMonth, startOfWeek, startOfYear, sub } from 'date-fns'
import { afterAll, describe, expect, it, vi } from 'vitest'

import { useGetDateRange } from '~/components/stat/date/useGetDateRange'

// Mock translation function
function t(key: string) {
  const translations: Record<string, string> = {
    'dates.day.current': 'Today',
    'dates.day.last': 'Yesterday',
    'dates.day.plural': 'days',
    'dates.day.simple': 'Days',
    'dates.last.day': 'Last',
    'dates.last.month': 'Last',
    'dates.last.simple': 'Last',
    'dates.last.week': 'Last',
    'dates.last.year': 'Last',
    'dates.month.current': 'This Month',
    'dates.month.last': 'Last Month',
    'dates.month.plural': 'months',
    'dates.month.simple': 'Months',
    'dates.week.current': 'This Week',
    'dates.week.last': 'Last Week',
    'dates.week.plural': 'weeks',
    'dates.week.simple': 'Weeks',
    'dates.year.current': 'This Year',
    'dates.year.last': 'Last Year',
    'dates.year.plural': 'years',
    'dates.year.simple': 'Years',
  }
  return translations[key] || key
}

// Fix "today" to June 15 2025 so tests don't depend on the current date
const fixedDate = new Date('2025-06-15T12:00:00')

// Must set fake timers before useGetDateRange captures `new Date()` internally
vi.useFakeTimers()
vi.setSystemTime(fixedDate)

describe('useGetDateRange', () => {
  const { formatDateToStringWithLast, getStringDateRange } = useGetDateRange(t)
  const today = fixedDate

  /** Call formatDateToStringWithLast for both 'start' and 'end', return concatenated label */
  function getLabel(params: { by: 'day' | 'month' | 'week' | 'year', duration: number, end: Date, start: Date }, isShowMaxRange?: boolean): string {
    const s = formatDateToStringWithLast({ ...params, type: 'start' }, isShowMaxRange)
    const e = formatDateToStringWithLast({ ...params, type: 'end' }, isShowMaxRange)
    return `${s}${e}`
  }

  afterAll(() => {
    vi.useRealTimers()
  })

  describe('year ranges', () => {
    it('should format current year', () => {
      const range = {
        end: endOfYear(today).getTime(),
        start: startOfYear(today).getTime(),
      }
      expect(getStringDateRange(range, 'year', 1)).toBe('2025')
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

  describe('formatDateToStringWithLast — current/last period labels', () => {
    it('shows "Today" for current day', () => {
      expect(getLabel({ by: 'day', duration: 1, end: today, start: today })).toBe('Today')
    })

    it('shows "Yesterday" for previous day', () => {
      const yesterday = sub(today, { days: 1 })
      expect(getLabel({ by: 'day', duration: 1, end: yesterday, start: yesterday })).toBe('Yesterday')
    })

    it('shows "This Month" for current month', () => {
      expect(getLabel({ by: 'month', duration: 1, end: endOfMonth(today), start: startOfMonth(today) })).toBe('This Month')
    })

    it('shows "Last Month" for previous month', () => {
      const lastMonth = sub(today, { months: 1 })
      expect(getLabel({ by: 'month', duration: 1, end: endOfMonth(lastMonth), start: startOfMonth(lastMonth) })).toBe('Last Month')
    })

    it('shows "Last N periods" when end is in current period', () => {
      const start = sub(today, { days: 2 })
      expect(getLabel({ by: 'day', duration: 3, end: today, start })).toBe('Last 3 days')
    })

    it('shows "d MMMM" for single day in current year (not today/yesterday)', () => {
      const date = new Date('2025-03-15T12:00:00')
      expect(getLabel({ by: 'day', duration: 1, end: date, start: date })).toBe('15 March')
    })

    it('shows "d MMM yyyy" for single day in past year', () => {
      const date = new Date('2024-06-15T12:00:00')
      expect(getLabel({ by: 'day', duration: 1, end: date, start: date })).toBe('15 Jun 2024')
    })
  })
})
