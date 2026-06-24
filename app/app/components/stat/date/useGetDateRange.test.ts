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

// Civil-day model: ranges are UTC-midnight epochs and labels render in UTC.
// Fix "today" to a local instant on June 15 2025 -> civil day 2025-06-15.
const fixedDate = new Date('2025-06-15T12:00:00')
const monthEnd = (y: number, m: number) => Date.UTC(y, m + 1, 1) - 1
const dayEnd = (y: number, m: number, d: number) => Date.UTC(y, m, d + 1) - 1

// Must set fake timers before useGetDateRange captures `today` internally
vi.useFakeTimers()
vi.setSystemTime(fixedDate)

describe('useGetDateRange', () => {
  const { formatDateToStringWithLast, getStringDateRange } = useGetDateRange(t)

  afterAll(() => {
    vi.useRealTimers()
  })

  describe('year ranges', () => {
    it('should format current year', () => {
      const range = { end: Date.UTC(2026, 0, 1) - 1, start: Date.UTC(2025, 0, 1) }
      expect(getStringDateRange(range, 'year', 1)).toBe('2025')
    })

    it('should format year range', () => {
      const range = { end: Date.UTC(2023, 11, 31), start: Date.UTC(2021, 0, 1) }
      expect(getStringDateRange(range, 'year', 2)).toBe('2021 - 2023')
    })
  })

  describe('month ranges', () => {
    it('should format month range in this year', () => {
      const range = { end: Date.UTC(2025, 2, 15), start: Date.UTC(2025, 1, 1) }
      expect(getStringDateRange(range, 'month', 2)).toBe('Feb - Mar')
    })

    it('should format month range across years', () => {
      const range = { end: monthEnd(2024, 1), start: Date.UTC(2023, 10, 1) }
      expect(getStringDateRange(range, 'month', 1)).toBe('Nov 2023 - Feb 2024')
    })
  })

  describe('week ranges', () => {
    it('should format week range in same month and year', () => {
      // 2024-10-14 is a Monday; 2024-11-03 is a Sunday.
      const range = { end: dayEnd(2024, 10, 3), start: Date.UTC(2024, 9, 14) }
      expect(getStringDateRange(range, 'week', 1)).toBe('14 Oct - 3 Nov 2024')
    })
  })

  describe('day ranges', () => {
    it('should format day range in same month', () => {
      const range = { end: dayEnd(2024, 2, 15), start: Date.UTC(2024, 2, 10) }
      expect(getStringDateRange(range, 'day', 5)).toBe('10-15 Mar 2024')
    })
  })

  describe('formatDateToStringWithLast - current/last period labels', () => {
    const todayCivil = new Date(Date.UTC(2025, 5, 15))

    it('shows "Today" for current day', () => {
      expect(formatDateToStringWithLast({ by: 'day', duration: 1, end: todayCivil, start: todayCivil })).toBe('Today')
    })

    it('shows "Yesterday" for previous day', () => {
      const yesterday = new Date(Date.UTC(2025, 5, 14))
      expect(formatDateToStringWithLast({ by: 'day', duration: 1, end: yesterday, start: yesterday })).toBe('Yesterday')
    })

    it('shows "This Month" for current month', () => {
      expect(formatDateToStringWithLast({ by: 'month', duration: 1, end: new Date(monthEnd(2025, 5)), start: new Date(Date.UTC(2025, 5, 1)) })).toBe('This Month')
    })

    it('shows "Last Month" for previous month', () => {
      expect(formatDateToStringWithLast({ by: 'month', duration: 1, end: new Date(monthEnd(2025, 4)), start: new Date(Date.UTC(2025, 4, 1)) })).toBe('Last Month')
    })

    it('shows "Last N periods" when end is in current period', () => {
      expect(formatDateToStringWithLast({ by: 'day', duration: 3, end: todayCivil, start: new Date(Date.UTC(2025, 5, 13)) })).toBe('Last 3 days')
    })

    it('shows "d MMMM" for single day in current year (not today/yesterday)', () => {
      const date = new Date(Date.UTC(2025, 2, 15))
      expect(formatDateToStringWithLast({ by: 'day', duration: 1, end: date, start: date })).toBe('15 March')
    })

    it('shows "d MMM yyyy" for single day in past year', () => {
      const date = new Date(Date.UTC(2024, 5, 15))
      expect(formatDateToStringWithLast({ by: 'day', duration: 1, end: date, start: date })).toBe('15 Jun 2024')
    })
  })
})
