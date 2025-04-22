export default defineAppConfig({
  icon: {
    customize: (content: string) => {
      return content
        .replace(/stroke-width="[^"]*"/g, `stroke-width="1.75"`)
    },
  },
  theme: {
    blackAsPrimary: true,
    radius: 0.5,
  },
  ui: {
    colors: {
      neutral: 'neutral',
      primary: 'black',
    },
  },
})
