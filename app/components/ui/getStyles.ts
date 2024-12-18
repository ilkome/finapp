export const classes = {
  item: {
    alt: 'bg-item-4',
    base: '',
    bg: 'bg-item-9',
    bg2: 'bg-item-4',
    center: 'flex items-center',
    center2: 'flex items-center justify-center',
    center3: 'flex-center',
    gap1: 'gap-3',
    link: `
      select-none
      text-secondary2
      hocus:bg-item-5
    `,
    minh1: 'min-h-[42px]',
    minh2: 'min-h-[38px]',
    minh3: 'min-h-[32px]',
    minh4: 'min-h-[44px]',
    minh5: 'min-h-[46px]',

    minw1: 'min-w-[42px]',
    minw2: 'min-w-[60px]',
    minw3: 'min-w-[32px]',

    padding1: 'px-2 py-1.5',
    padding2: 'px-2',
    padding3: 'px-3',

    padding4: 'px-1',

    rounded: 'rounded-md',
    rounded2: 'rounded-lg',
    shadow: `
      shadow hocus:shadow-lg
    `,
    simple: '',
  },

  modal: {
    bg: 'bg-item-4',
    padding1: 'px-2 pt-6 !pb-2',
    rounded: 'rounded-xl',
  },
} as const

export function getStyles(group: string, elements: string[]) {
  return elements.map(name => classes[group][name]).join(' ')
}
