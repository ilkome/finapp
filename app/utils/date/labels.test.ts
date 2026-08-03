import { afterAll, describe, expect, it, vi } from 'vitest'
import { createRangeFormatter } from '~~/utils/date/labels'

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

// Must set fake timers before createRangeFormatter captures `today` internally
vi.useFakeTimers()
vi.setSystemTime(fixedDate)

describe('createRangeFormatter', () => {
  const { formatRange, formatRangeWithLast } = createRangeFormatter(t)

  afterAll(() => {
    vi.useRealTimers()
  })

  describe('year ranges', () => {
    it('should format current year', () => {
      const range = { end: Date.UTC(2026, 0, 1) - 1, start: Date.UTC(2025, 0, 1) }
      expect(formatRange(range, 'year', 1)).toBe('2025')
    })

    it('should format year range', () => {
      const range = { end: Date.UTC(2023, 11, 31), start: Date.UTC(2021, 0, 1) }
      expect(formatRange(range, 'year', 2)).toBe('2021 - 2023')
    })
  })

  describe('month ranges', () => {
    it('should format month range in this year', () => {
      const range = { end: Date.UTC(2025, 2, 15), start: Date.UTC(2025, 1, 1) }
      expect(formatRange(range, 'month', 2)).toBe('Feb - Mar')
    })

    it('should format month range across years', () => {
      const range = { end: monthEnd(2024, 1), start: Date.UTC(2023, 10, 1) }
      expect(formatRange(range, 'month', 1)).toBe('Nov 2023 - Feb 2024')
    })
  })

  describe('week ranges', () => {
    it('should format week range in same month and year', () => {
      // 2024-10-14 is a Monday; 2024-11-03 is a Sunday.
      const range = { end: dayEnd(2024, 10, 3), start: Date.UTC(2024, 9, 14) }
      expect(formatRange(range, 'week', 1)).toBe('14 Oct - 3 Nov 2024')
    })
  })

  describe('day ranges', () => {
    it('should format day range in same month', () => {
      const range = { end: dayEnd(2024, 2, 15), start: Date.UTC(2024, 2, 10) }
      expect(formatRange(range, 'day', 5)).toBe('10-15 Mar 2024')
    })
  })

  describe('formatRangeWithLast - current/last period labels', () => {
    const todayCivil = new Date(Date.UTC(2025, 5, 15))

    it('shows "Today" for current day', () => {
      expect(formatRangeWithLast({ by: 'day', duration: 1, end: todayCivil, start: todayCivil })).toBe('Today')
    })

    it('shows "Yesterday" for previous day', () => {
      const yesterday = new Date(Date.UTC(2025, 5, 14))
      expect(formatRangeWithLast({ by: 'day', duration: 1, end: yesterday, start: yesterday })).toBe('Yesterday')
    })

    it('shows "This Month" for current month', () => {
      expect(formatRangeWithLast({ by: 'month', duration: 1, end: new Date(monthEnd(2025, 5)), start: new Date(Date.UTC(2025, 5, 1)) })).toBe('This Month')
    })

    it('shows "Last Month" for previous month', () => {
      expect(formatRangeWithLast({ by: 'month', duration: 1, end: new Date(monthEnd(2025, 4)), start: new Date(Date.UTC(2025, 4, 1)) })).toBe('Last Month')
    })

    it('shows "This Year" for current year', () => {
      expect(formatRangeWithLast({ by: 'year', duration: 1, end: new Date(monthEnd(2025, 11)), start: new Date(Date.UTC(2025, 0, 1)) })).toBe('This Year')
    })

    it('shows "Last Year" for previous year', () => {
      expect(formatRangeWithLast({ by: 'year', duration: 1, end: new Date(monthEnd(2024, 11)), start: new Date(Date.UTC(2024, 0, 1)) })).toBe('Last Year')
    })

    it('shows "Last N periods" when end is in current period', () => {
      expect(formatRangeWithLast({ by: 'day', duration: 3, end: todayCivil, start: new Date(Date.UTC(2025, 5, 13)) })).toBe('Last 3 days')
    })

    it.each([
      ['day', 3, new Date(Date.UTC(2025, 5, 13))],
      ['month', 3, new Date(Date.UTC(2025, 3, 1))],
      ['year', 3, new Date(Date.UTC(2023, 0, 1))],
    ] as const)('shows "Last N periods" for current multi-%s ranges', (by, duration, start) => {
      expect(formatRangeWithLast({ by, duration, end: todayCivil, start })).toBe(`Last ${duration} ${by}s`)
    })

    it('uses the translation choice for Russian plural forms', () => {
      const ru = createRangeFormatter((key, choice) => {
        if (key === 'dates.last.day')
          return 'Последние'
        if (key === 'dates.day.current')
          return 'Сегодня'
        if (key === 'dates.day.plural')
          return ({ 1: 'день', 2: 'дня', 5: 'дней', 21: 'день' } as Record<number, string>)[choice!]!
        return key
      }, 'ru')

      expect(ru.formatRangeWithLast({
        by: 'day',
        duration: 1,
        end: todayCivil,
        start: todayCivil,
      })).toBe('Сегодня')

      for (const duration of [2, 5, 21]) {
        expect(ru.formatRangeWithLast({
          by: 'day',
          duration,
          end: todayCivil,
          start: new Date(Date.UTC(2025, 5, 15 - duration + 1)),
        })).toBe(`Последние ${duration} ${({ 1: 'день', 2: 'дня', 5: 'дней', 21: 'день' } as Record<number, string>)[duration]}`)
      }
    })

    it('shows "d MMMM" for single day in current year (not today/yesterday)', () => {
      const date = new Date(Date.UTC(2025, 2, 15))
      expect(formatRangeWithLast({ by: 'day', duration: 1, end: date, start: date })).toBe('15 March')
    })

    it('shows "d MMM yyyy" for single day in past year', () => {
      const date = new Date(Date.UTC(2024, 5, 15))
      expect(formatRangeWithLast({ by: 'day', duration: 1, end: date, start: date })).toBe('15 Jun 2024')
    })

    it('falls back to calendar formatting for past ranges', () => {
      expect(formatRangeWithLast({
        by: 'month',
        duration: 2,
        end: new Date(monthEnd(2025, 3)),
        start: new Date(Date.UTC(2025, 2, 1)),
      })).toBe('Mar - Apr')
    })

    it('suppresses relative formatting for the overall max range', () => {
      expect(formatRangeWithLast({
        by: 'day',
        duration: 3,
        end: todayCivil,
        start: new Date(Date.UTC(2025, 5, 13)),
      }, true)).toBe('13-15 Jun')
    })

    it('suppresses singleton current and last labels for the overall max range', () => {
      expect(formatRangeWithLast({
        by: 'day',
        duration: 1,
        end: todayCivil,
        start: new Date(Date.UTC(2025, 5, 14)),
      }, true)).toBe('14-15 Jun')
    })
  })
})
