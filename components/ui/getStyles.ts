export const classes = {
  item: {
    alt: 'bg-item-4',
    base: '',
    bg: `
      bg-item-4
    `,
    center: 'flex items-center',
    gap1: 'gap-3',
    link: `
      select-none
      text-secondary2
      hocus:bg-item-5
      _hocus:bg-neutral-800/50
    `,
    menu: `
      flex items-center
      py-2
      gap-3
    `,
    minh: 'min-h-[42px]',
    minh2: 'min-h-[38px]',
    minw1: 'min-w-[42px]',
    minw2: 'min-w-[60px]',
    padding1: 'px-2 py-1.5',
    padding2: 'px-2',
    padding3: 'px-3',
    paddings: {
      base: '',
    },
    rounded: 'rounded-md',
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
  return elements.map(name => classes[group][name])
}
