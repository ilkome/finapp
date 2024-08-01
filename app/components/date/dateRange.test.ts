import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(isBetween)

describe('get date ranges', () => {
  it('get date to end', () => {
    const start = dayjs('2020-04-13 19:18')
    const date = dayjs('2020-04-13 19:18')
    const end = dayjs('2020-04-13 19:20')

    const isBetween = dayjs(date).isBetween(start, end, null, '[)')
    expect(isBetween).toEqual(true)
  })

  it('get date to end2', () => {
    const start = dayjs('2020-04-13 19:18')
    const date = dayjs('2020-04-13 19:18')
    const end = dayjs('2020-04-13 19:18')

    const isBetween = dayjs(date).isBetween(start, end, null, '[)')
    expect(isBetween).toEqual(false)
  })
})
