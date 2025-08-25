export default defineAppConfig({
  icon: {
    customize: (content: string) => {
      return content
        .replace(/stroke-width="[^"]*"/g, `stroke-width="1.75"`)
    },
  },
  theme: {
    blackAsPrimary: true,
    radius: 0.375,
  },
  ui: {
    calendar: {
      slots: {
        body: '!flex-col !space-y-8',
        cellTrigger: 'data-[disabled]:hover:bg-transparent data-today:bg-primary/10',
        root: 'p-2 pt-0',
      },
    },
    colors: {
      neutral: 'neutral',
      primary: 'black',
    },
    commandPalette: {
      slots: {
        group: 'p-0 py-1 first:pt-0',
        item: 'p-0',
        label: 'z-20 mb-px sticky top-0 bg-default',
        viewport: 'scrollerBlock',
      },
    },
    toast: {
      slots: {
        title: 'text-5xl',
      },
    },
  },
})
