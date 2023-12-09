export const classes = {
  item: {
    simple: '',
    link: `
      cursor-pointer
      hocus_bg-item-main-hover
      transition
    `,
    bg: `
      bg-item-main-bg
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
      py-3
    `,
    menuModal: 'px-4 gap-x-4',
    menuSidebar: 'px-5 gap-x-5',
  },

  modal: {
    bg: 'bg-item-main-bg',
    rounded: 'rounded-xl',
    padding1: 'px-2 pt-6 !pb-2',
  },
}

export function getStyles(group: string, elements: string[]) {
  return elements.map(name => classes[group][name])
}
