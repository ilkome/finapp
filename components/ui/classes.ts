export const classes = {
  item: {
    simple: '',
    link: `
      select-none
      text-secondary2
      hocus_bg-item-5
    `,
    bg: `
      bg-item-4
    `,
    base: '',
    rounded: 'rounded-md',
    padding1: 'px-2 py-1.5',
    minh: 'min-h-[42px]',
    paddings: {
      base: '',
    },
    shadow: `
      shadow hocus_shadow-lg
    `,
    menu: `
      flex items-center
      py-2
      h-[36px]
    `,
    menuModal: 'px-4 gap-x-4',
    menuSidebar: 'px-3 gap-3',
  },

  modal: {
    bg: 'bg-item-4',
    rounded: 'rounded-xl',
    padding1: 'px-2 pt-6 !pb-2',
  },
} as const

export function getStyles(group: string, elements: string[]) {
  return elements.map(name => classes[group][name])
}
