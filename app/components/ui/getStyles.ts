export const classes = {
  item: {
    alt: 'bg-item-3',
    base: '',
    bg: 'bg-item-2',
    bg2: 'bg-item-3',
    center: 'flex items-center',
    center2: 'flex items-center justify-center',
    center3: 'flex-center',
    gap1: 'gap-3',
    link: `
      select-none
      hover:bg-elevated
    `,
    minh1: 'min-h-[42px]',
    minh2: 'min-h-[38px]',
    minh3: 'min-h-[32px]',
    minh4: 'min-h-[44px]',
    minh5: 'min-h-[46px]',

    minw1: 'min-w-[42px]',
    minw2: 'min-w-[60px]',
    minw3: 'min-w-[32px]',
    minw4: 'min-w-[38px]',

    padding1: 'px-2 py-1.5',
    padding2: 'px-2',
    padding3: 'px-3',
    padding4: 'px-1',

    rounded: 'rounded-sm',
    rounded2: 'rounded-lg',
    rounded3: 'rounded-xl',
    simple: '',
  },

  modal: {
    bg: 'bg-item-3',
    padding1: 'px-2 pt-6 !pb-2',
    rounded: 'rounded-xl',
  },
} as const

export function getStyles(group: string, elements: string[]) {
  return elements.map(name => classes[group][name]).join(' ')
}
