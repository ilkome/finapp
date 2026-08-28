export default defineAppConfig({
  assistant: {
    explainWithAi: false,
    floatingInput: false,
  },
  github: {
    url: 'https://github.com/ilkome/finapp',
  },
  header: {
    title: 'Finapp',
  },
  ui: {
    colors: {
      primary: 'pink',
    },
    prose: {
      codeIcon: {
        // Remove once Nuxt Icon or Docus handles .env.local.
        '.env.local': 'i-vscode-icons-file-type-dotenv',
      },
    },
  },
})
