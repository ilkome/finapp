export default defineAppConfig({
  ui: {
    popover: {
      background: 'bg-foreground-4',
      popper: {
        placement: 'bottom-start',
      },
      ring: '!ring-2 !ring-foreground-1',
      trigger: 'w-full',
    },
    strategy: 'override',
  },
})
