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
    colors: {
      neutral: 'neutral',
      primary: 'black',
    },
    commandPalette: {
      slots: {
        group: 'p-0 py-1 first:pt-0',
        item: 'p-0',
        label: 'z-10 sticky top-0 bg-default',
        viewport: 'scrollerBlock',
      },
    },
  },
})
