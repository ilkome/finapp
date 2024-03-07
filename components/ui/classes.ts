export const classes = {
  item: {
    simple: '',
    link: `
      cursor-pointer select-none
      text-secondary2
      hocus_bg-item-5
      transition
    `,
    bg: `
      bg-item-4
    `,
    base: '',
    rounded: 'rounded-md',
    paddings: {
      base: '',
    },
    shadow: `
      shadow hocus_shadow-lg
    `,
    menu: `
      flex items-center
      py-2
    `,
    menuModal: 'px-4 gap-x-4',
    menuSidebar: 'px-5 gap-x-5',
  },

  modal: {
    bg: 'bg-item-4',
    rounded: 'rounded-xl',
    padding1: 'px-2 pt-6 !pb-2',
  },
}

export function getStyles(group: string, elements: string[]) {
  return elements.map(name => classes[group][name])
}
