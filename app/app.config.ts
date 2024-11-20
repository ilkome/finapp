export default defineAppConfig({
  icon: {
    customize: (content: string) => {
      return content
        .replace(/stroke-width="[^"]*"/g, `stroke-width="1.5"`)
    },
  },
  ui: {
    popover: {
      background: 'bg-foreground-4 min-w-64',
      popper: {
        placement: 'bottom-start',
      },
      ring: '!ring-2 !ring-item-3',
      trigger: 'w-full',
    },
    strategy: 'override',
  },
})
