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
    modal: {
      slots: {
        overlay: '!bg-overlay',
      },
    },
    selectMenu: {
      defaultVariants: {
        size: 'lg',
        variant: 'outline',
      },
      slots: {
        base: 'min-h-[42px] px-4 min-w-[160px]',
        item: 'hover:bg-elevated/50 rounded-sm',
      },
      variants: {
        variant: {
          outline: 'bg-elevated/30 hover:!bg-elevated/50',
        },
      },
    },
    toast: {
      props: {
        close: false,
      },
      slots: {
        description: 'text-highlighted',
        title: 'text-3xl',
        wrapper: 'flex-row items-center gap-3',
      },
    },
    tooltip: {
      slots: {
        kbds: 'hidden md:inline-flex items-center shrink-0 gap-0.5 not-first-of-type:before:content-[\'·\'] not-first-of-type:before:me-0.5',
      },
    },
  },
})
