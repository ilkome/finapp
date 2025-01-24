export default defineAppConfig({
  icon: {
    customize: (content: string) => {
      return content
        .replace(/stroke-width="[^"]*"/g, `stroke-width="1.75"`)
    },
  },
  ui: {
    button: {
      color: {
        blue: {
          outline: 'border border-accent-1 hover:border-accent-1 hover:bg-accent-1/10 text-accent-1/90',
          solid: 'bg-accent-1 hover:bg-accent-1/80 text-icon-primary',
        },
        pink: {
          outline: 'border border-accent-1 hover:border-accent-1 hover:bg-accent-1/10 text-accent-1/90',
          solid: 'bg-accent-1 hover:bg-accent-1/80 text-icon-primary',
        },
      },
    },
    gray: 'cool',

    popover: {
      background: '!bg-item-1 min-w-64',
      popper: {
        placement: 'bottom-start',
      },
      ring: '!ring-2 !ring-item-4',
      trigger: '!w-full !block !cursor-default',
    },

    primary: 'pink',
    strategy: 'merge',
  },
})
