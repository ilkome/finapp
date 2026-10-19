// The app's logger reads Nuxt's `import.meta.dev`; under Deno it is simply undefined.
interface ImportMeta {
  dev?: boolean
}
