const actionMenu = {
  defaultVariants: {
    size: 'md' as const,
  },
  slots: {
    content: 'border border-accented ring-0',
    group: 'relative p-1 [&:not(:first-child)]:before:absolute [&:not(:first-child)]:before:top-0 [&:not(:first-child)]:before:right-2 [&:not(:first-child)]:before:left-12 [&:not(:first-child)]:before:h-px [&:not(:first-child)]:before:bg-elevated/50',
    item: 'min-h-10.5 items-center! gap-3! px-2! py-1.5! text-sm! leading-none font-medium tracking-wide',
    itemLeadingIcon: 'size-5!',
    label: 'min-h-10.5 gap-3! px-2! py-1.5! text-sm! leading-none font-medium tracking-wide',
    separator: 'mx-2! my-0! ms-12! h-px bg-elevated/50',
    viewport: 'divide-y-0!',
  },
  variants: {
    active: {
      false: {
        item: 'text-toned data-highlighted:text-highlighted data-[state=open]:text-highlighted',
        itemLeadingIcon: 'text-muted group-data-highlighted:text-default group-data-[state=open]:text-default',
      },
    },
  },
}

export default defineAppConfig({
  icon: {
    customize: (content: string) => {
      return content
        .replace(/stroke-width="[^"]*"/g, `stroke-width="1.75"`)
    },
  },
  ui: {
    button: {
      slots: {
        base: 'theme-rounded-control',
      },
    },
    calendar: {
      slots: {
        body: 'flex-col! space-y-8!',
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
        viewport: 'scroller-block',
      },
    },
    contextMenu: actionMenu,
    dropdownMenu: actionMenu,
    modal: {
      slots: {
        overlay: 'bg-overlay!',
      },
    },
    popover: {
      slots: {
        content: 'w-[22rem] max-w-sm',
      },
    },
    radioGroup: {
      slots: {
        fieldset: 'flex-wrap gap-1',
        item: 'bg-elevated/30 rounded-sm',
      },
    },
    selectMenu: {
      defaultVariants: {
        size: 'lg',
        variant: 'outline',
      },
      slots: {
        base: 'min-h-10.5 px-4 min-w-40',
        item: 'hover:bg-elevated/50 rounded-sm',
      },
      variants: {
        variant: {
          outline: 'bg-elevated/30 hover:bg-elevated/50!',
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
