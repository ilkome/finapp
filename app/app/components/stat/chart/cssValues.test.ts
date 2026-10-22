import { describe, expect, it } from 'vitest'

import { resolveCssValues } from '~/components/stat/chart/cssValues'

describe('resolveCssValues', () => {
  const resolve = (css: string, key: string) => `${key}=${css}`

  it('resolves CSS functions anywhere in the option and keeps the rest', () => {
    const formatter = () => ''
    const option = {
      series: [{ data: [1, 2], itemStyle: { color: 'var(--ui-bg)' }, name: 'Food' }],
      textStyle: { color: '#fff', fontFamily: 'var(--font-secondary)' },
      tooltip: { formatter, shadow: 'color-mix(in oklab, var(--a) 50%, transparent)' },
    }
    expect(resolveCssValues(option, resolve)).toEqual({
      series: [{ data: [1, 2], itemStyle: { color: 'color=var(--ui-bg)' }, name: 'Food' }],
      textStyle: { color: '#fff', fontFamily: 'fontFamily=var(--font-secondary)' },
      tooltip: { formatter, shadow: 'shadow=color-mix(in oklab, var(--a) 50%, transparent)' },
    })
  })

  it('keeps class instances as they are', () => {
    class Gradient { color = 'var(--a)' }
    const gradient = new Gradient()
    expect(resolveCssValues({ color: gradient }, resolve).color).toBe(gradient)
  })
})
